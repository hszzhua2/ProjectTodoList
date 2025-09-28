import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  Download,
  Upload,
  Settings,
  RefreshCw,
  FileText,
  BarChart3,
  Building2
} from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import GanttChart from './components/GanttChart.jsx';
import HorizontalGanttChart from './components/HorizontalGanttChart.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import ProjectDashboard from './components/ProjectDashboard.jsx';
import ItemEditModal from './components/ItemEditModal.jsx';
import JsonImportExport from './components/JsonImportExport.jsx';
import ProjectTemplates from './components/ProjectTemplates.jsx';
import { projectService } from './services/ProjectService.js';
import { JsonHelper } from './utils/JsonHelper.js';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('gantt');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 处理事项点击
  const handleItemClick = (stageId, linkId, item) => {
    setSelectedItem({ stageId, linkId, item });
    setIsItemModalOpen(true);
  };

  // 处理添加事项
  const handleAddItem = (stageId, linkId) => {
    setSelectedItem({ stageId, linkId, item: null });
    setIsItemModalOpen(true);
  };

  // 打开JSON管理弹窗
  const handleOpenJsonModal = () => {
    setIsJsonModalOpen(true);
  };

  // 打开项目模板弹窗
  const handleOpenTemplateModal = () => {
    setIsTemplateModalOpen(true);
  };

  // 处理JSON导入成功
  const handleJsonImportSuccess = (data) => {
    setRefreshKey(prev => prev + 1);
  };

  // 处理JSON导出成功
  const handleJsonExportSuccess = (data) => {
    // 可以添加成功提示
  };

  // 处理模板选择
  const handleTemplateSelect = (template) => {
    setRefreshKey(prev => prev + 1);
  };

  // 重置项目
  const handleResetProject = () => {
    if (confirm('确定要重置项目吗？这将清除所有数据并恢复到默认状态。')) {
      try {
        projectService.resetToDefault();
        setRefreshKey(prev => prev + 1);
        alert('项目已重置为默认状态');
      } catch (error) {
        console.error('重置失败:', error);
        alert('重置失败: ' + error.message);
      }
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // 处理事项保存
  const handleItemSave = (savedItem) => {
    setRefreshKey(prev => prev + 1);
  };

  // 处理事项删除
  const handleItemDelete = (deletedItem) => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        {/* 头部 */}
        <header className="app-header">
          <div className="header-content">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="header-title">
                      医院项目管理系统
                    </h1>
                    <p className="header-subtitle">
                      HospitalProjectManager - 专业的医院建设项目全生命周期管理工具
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <ThemeToggle />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="gap-2 btn-hover"
                >
                  <RefreshCw className="h-4 w-4" />
                  刷新
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenTemplateModal}
                  className="gap-2 btn-hover"
                >
                  <FileText className="h-4 w-4" />
                  模板
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenJsonModal}
                  className="gap-2 btn-hover"
                >
                  <Upload className="h-4 w-4" />
                  数据
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetProject}
                  className="gap-2 text-red-600 hover:text-red-700 btn-hover"
                >
                  <Settings className="h-4 w-4" />
                  重置
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col fade-in">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="bg-white border-b px-6 py-3">
                <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-50 p-1">
                  <TabsTrigger 
                    value="gantt" 
                    className="flex items-center gap-2 tabs-trigger"
                  >
                    <BarChart3 className="h-4 w-4" />
                    甘特图视图
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dashboard" 
                    className="flex items-center gap-2 tabs-trigger"
                  >
                    <Building2 className="h-4 w-4" />
                    项目概览
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="gantt" className="flex-1 overflow-hidden">
                <div className="h-full slide-in">
                  <HorizontalGanttChart
                    key={refreshKey}
                    onItemClick={handleItemClick}
                    onAddItem={handleAddItem}
                  />
                </div>
              </TabsContent>

              <TabsContent value="dashboard" className="flex-1 overflow-hidden">
                <div className="h-full slide-in p-6">
                  <ProjectDashboard key={refreshKey} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* 页脚 */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-text">
              <p>医院项目管理系统 - 专业的医院建设项目全生命周期管理工具</p>
              <p className="mt-1">支持项目阶段管理、六大链路跟踪、事项管理和数据导入导出</p>
            </div>
          </div>
        </footer>

        {/* 事项编辑弹出窗口 */}
        <ItemEditModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          stageId={selectedItem?.stageId}
          linkId={selectedItem?.linkId}
          item={selectedItem?.item}
          onSave={handleItemSave}
          onDelete={handleItemDelete}
        />

        {/* JSON导入导出弹出窗口 */}
        <JsonImportExport
          isOpen={isJsonModalOpen}
          onClose={() => setIsJsonModalOpen(false)}
          onImportSuccess={handleJsonImportSuccess}
          onExportSuccess={handleJsonExportSuccess}
        />

        {/* 项目模板弹出窗口 */}
        <ProjectTemplates
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onTemplateSelect={handleTemplateSelect}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
