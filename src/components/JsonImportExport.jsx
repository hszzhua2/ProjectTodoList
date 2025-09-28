import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  Eye,
  Trash2,
  RefreshCw,
  FileJson,
  Database
} from 'lucide-react';
import { JsonHelper } from '../utils/JsonHelper.js';
import { projectService } from '../services/ProjectService.js';

const JsonImportExport = ({ 
  isOpen, 
  onClose, 
  onImportSuccess, 
  onExportSuccess 
}) => {
  const [activeTab, setActiveTab] = useState('import');
  const [importData, setImportData] = useState('');
  const [exportData, setExportData] = useState('');
  const [fileName, setFileName] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const fileInputRef = useRef(null);

  // 重置状态
  const resetState = () => {
    setImportData('');
    setExportData('');
    setFileName('');
    setValidationResult(null);
    setPreviewData(null);
    setIsLoading(false);
  };

  // 处理文件选择
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const jsonData = await JsonHelper.readFromFile(file);
      const jsonString = JsonHelper.stringify(jsonData, true);
      setImportData(jsonString);
      setFileName(file.name);
      
      // 验证数据
      const validation = JsonHelper.validateProjectData(jsonData);
      setValidationResult(validation);
      
      if (validation.isValid) {
        setPreviewData(jsonData);
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: [error.message]
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理手动输入的JSON
  const handleJsonInput = (value) => {
    setImportData(value);
    
    if (value.trim()) {
      try {
        const jsonData = JsonHelper.parse(value);
        const validation = JsonHelper.validateProjectData(jsonData);
        setValidationResult(validation);
        
        if (validation.isValid) {
          setPreviewData(jsonData);
        } else {
          setPreviewData(null);
        }
      } catch (error) {
        setValidationResult({
          isValid: false,
          errors: ['JSON格式错误: ' + error.message]
        });
        setPreviewData(null);
      }
    } else {
      setValidationResult(null);
      setPreviewData(null);
    }
  };

  // 执行导入
  const handleImport = async () => {
    if (!importData.trim() || !validationResult?.isValid) {
      return;
    }

    setIsLoading(true);
    try {
      const jsonData = JsonHelper.parse(importData);
      projectService.loadProjectData(jsonData);
      
      if (onImportSuccess) {
        onImportSuccess(jsonData);
      }
      
      onClose();
      resetState();
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: ['导入失败: ' + error.message]
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 生成导出数据
  const generateExportData = () => {
    try {
      const jsonData = projectService.exportProjectData();
      setExportData(jsonData);
      
      // 生成默认文件名
      const defaultFileName = JsonHelper.generateFileName('hospital-project');
      setFileName(defaultFileName);
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: ['导出失败: ' + error.message]
      });
    }
  };

  // 执行导出
  const handleExport = () => {
    if (!exportData) {
      generateExportData();
      return;
    }

    try {
      const jsonData = JsonHelper.parse(exportData);
      const finalFileName = fileName || JsonHelper.generateFileName('hospital-project');
      JsonHelper.downloadAsFile(jsonData, finalFileName);
      
      if (onExportSuccess) {
        onExportSuccess(jsonData);
      }
      
      onClose();
      resetState();
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: ['导出失败: ' + error.message]
      });
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // 这里可以添加成功提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 格式化JSON
  const formatJson = () => {
    if (importData.trim()) {
      try {
        const formatted = JsonHelper.prettify(importData);
        setImportData(formatted);
      } catch (error) {
        // 忽略格式化错误
      }
    }
  };

  // 获取预览统计信息
  const getPreviewStats = () => {
    if (!previewData || !previewData.stages) return null;
    
    let totalStages = previewData.stages.length;
    let totalLinks = 0;
    let totalItems = 0;
    
    previewData.stages.forEach(stage => {
      if (stage.links) {
        totalLinks += stage.links.length;
        stage.links.forEach(link => {
          if (link.items) {
            totalItems += link.items.length;
          }
        });
      }
    });
    
    return { totalStages, totalLinks, totalItems };
  };

  const previewStats = getPreviewStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            JSON 数据管理
          </DialogTitle>
          <DialogDescription>
            导入或导出项目数据，支持JSON格式的数据交换
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              导入数据
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              导出数据
            </TabsTrigger>
          </TabsList>

          {/* 导入标签页 */}
          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              {/* 文件上传 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">从文件导入</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      选择JSON文件
                    </Button>
                    {fileName && (
                      <Badge variant="secondary" className="gap-1">
                        <FileText className="h-3 w-3" />
                        {fileName}
                      </Badge>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </CardContent>
              </Card>

              {/* 手动输入 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    手动输入JSON
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={formatJson}
                        disabled={!importData.trim()}
                        className="h-6 px-2"
                      >
                        格式化
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setImportData('')}
                        disabled={!importData.trim()}
                        className="h-6 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="粘贴JSON数据..."
                    value={importData}
                    onChange={(e) => handleJsonInput(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </CardContent>
              </Card>

              {/* 验证结果 */}
              {validationResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      {validationResult.isValid ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          验证通过
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          验证失败
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {validationResult.isValid ? (
                      <div className="text-sm text-green-600">
                        数据格式正确，可以安全导入
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {validationResult.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-600 flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 数据预览 */}
              {previewData && previewStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      数据预览
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {previewStats.totalStages}
                        </div>
                        <div className="text-gray-600">项目阶段</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {previewStats.totalLinks}
                        </div>
                        <div className="text-gray-600">管理链路</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {previewStats.totalItems}
                        </div>
                        <div className="text-gray-600">项目事项</div>
                      </div>
                    </div>
                    
                    {previewData.name && (
                      <div className="mt-3 pt-3 border-t text-sm">
                        <div className="font-medium">项目名称: {previewData.name}</div>
                        {previewData.description && (
                          <div className="text-gray-600 mt-1">
                            描述: {previewData.description}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* 导出标签页 */}
          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              {/* 导出设置 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">导出设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="export-filename">文件名</Label>
                    <Input
                      id="export-filename"
                      placeholder="输入文件名..."
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={generateExportData}
                    className="w-full gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    生成导出数据
                  </Button>
                </CardContent>
              </Card>

              {/* 导出数据预览 */}
              {exportData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      导出数据预览
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(exportData)}
                        className="h-6 px-2 gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        复制
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] w-full">
                      <pre className="text-xs font-mono bg-gray-50 p-3 rounded border">
                        {exportData}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          
          <div className="flex gap-2">
            {activeTab === 'import' && (
              <Button
                onClick={handleImport}
                disabled={!validationResult?.isValid || isLoading}
                className="gap-2"
              >
                <Database className="h-4 w-4" />
                {isLoading ? '导入中...' : '导入数据'}
              </Button>
            )}
            
            {activeTab === 'export' && (
              <Button
                onClick={handleExport}
                disabled={!exportData}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                下载文件
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JsonImportExport;
