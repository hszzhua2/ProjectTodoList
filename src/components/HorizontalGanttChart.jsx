import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Calendar, Plus, AlertCircle } from 'lucide-react';
import { projectService } from '../services/ProjectService.js';
import LoadingSpinner, { GanttSkeleton } from './LoadingSpinner.jsx';
import { ErrorMessage } from './ErrorBoundary.jsx';
import ItemCard from './ItemCard.jsx';

const HorizontalGanttChart = ({ onItemClick, onAddItem }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProjectData();
  }, []);

  const loadProjectData = async () => {
    setLoading(true);
    setError(null);
    try {
      const projectData = await projectService.getCurrentProject();
      setProject(projectData);
    } catch (err) {
      console.error('加载项目数据失败:', err);
      setError(err.message || '加载项目数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (stageId, linkId, item) => {
    if (onItemClick) {
      onItemClick(stageId, linkId, item);
    }
  };

  const handleAddItem = (stageId, linkId) => {
    if (onAddItem) {
      onAddItem(stageId, linkId);
    }
  };

  // 获取链路颜色
  const getLinkColor = (linkIndex) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    return colors[linkIndex % colors.length];
  };

  // 获取链路在所有阶段中的事项
  const getLinkItemsAcrossStages = (linkName) => {
    if (!project || !project.stages) return [];
    
    return project.stages.map(stage => {
      const link = stage.links.find(l => l.name === linkName);
      return {
        stageId: stage.id,
        stageName: stage.name,
        linkId: link?.id,
        items: link?.items || []
      };
    });
  };

  // 获取所有唯一的链路名称
  const getAllLinkNames = () => {
    if (!project || !project.stages || project.stages.length === 0) return [];
    
    // 从第一个阶段获取链路名称（假设所有阶段都有相同的链路）
    const firstStage = project.stages[0];
    return firstStage.links.map(link => link.name);
  };

  if (loading) {
    return (
      <div className="w-full h-full">
        <Card className="h-full">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">横向甘特图</h2>
                <p className="text-sm text-gray-600">正在加载项目数据...</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <LoadingSpinner 
              size="large" 
              text="正在加载项目数据..." 
              type="project"
              className="py-12"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full">
        <Card className="h-full">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">横向甘特图</h2>
                <p className="text-sm text-gray-600">项目阶段和链路管理</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ErrorMessage
              title="数据加载失败"
              message={error}
              onRetry={loadProjectData}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project || !project.stages || project.stages.length === 0) {
    return (
      <div className="w-full h-full">
        <Card className="h-full">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">横向甘特图</h2>
                <p className="text-sm text-gray-600">项目阶段和链路管理</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无项目数据</h3>
              <p className="text-gray-600 mb-4">请导入项目数据或使用模板创建新项目</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const linkNames = getAllLinkNames();

  return (
    <div className="w-full h-full fade-in">
      <Card className="h-full enhanced-card">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {project.name || '医院建设项目'} - 横向甘特图
              </h2>
              {project.description && (
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* 阶段标题行 */}
            <div className="flex border-b bg-gray-50 dark:bg-slate-700 sticky top-0 z-10 horizontal-gantt-header">
              <div className="w-48 border-r bg-white dark:bg-slate-800 horizontal-gantt-link-header flex items-center justify-center" style={{ minHeight: '60px' }}>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm text-center">链路 / 阶段</h3>
              </div>
              {project.stages.map((stage, index) => (
                <div 
                  key={stage.id} 
                  className="flex-1 min-w-56 border-r text-center horizontal-gantt-cell flex items-center justify-center"
                  style={{ minWidth: '224px', minHeight: '60px' }}
                >
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">
                      {stage.name}
                    </div>
                    {stage.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {stage.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 滚动区域 */}
            <div className="flex-1 overflow-auto horizontal-gantt-scroll enhanced-scrollbar smooth-scroll scroll-optimized">
              <div className="min-h-full">
                {linkNames.map((linkName, linkIndex) => {
                  const linkColor = getLinkColor(linkIndex);
                  const linkData = getLinkItemsAcrossStages(linkName);
                  
                  return (
                    <div key={linkName} className="flex border-b hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors table-row-hover" style={{ minHeight: '80px' }}>
                      {/* 链路名称列 */}
                      <div 
                        className="w-48 border-r bg-white dark:bg-slate-800 flex items-center horizontal-gantt-link-header sticky left-0 z-5"
                        style={{ borderLeftColor: linkColor, borderLeftWidth: '4px', minHeight: '80px' }}
                      >
                        <div className="flex-1 min-w-0 text-center">
                          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm truncate">
                            {linkName}
                          </div>
                          {linkData.length > 0 && linkData[0].linkId && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {project.stages[0].links.find(l => l.name === linkName)?.owner}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 各阶段的事项列 */}
                      {linkData.map((stageData, stageIndex) => (
                        <div 
                          key={`${linkName}-${stageData.stageId}`}
                          className="flex-1 min-w-56 p-2 border-r horizontal-gantt-cell"
                          style={{ minWidth: '224px', minHeight: '80px' }}
                        >
                          <div className="space-y-2 h-full">
                            {/* 事项列表 */}
                            <div className="space-y-2">
                              {stageData.items.map((item, itemIndex) => (
                                <div key={item.id}>
                                  <ItemCard
                                    item={item}
                                    linkColor={linkColor}
                                    onClick={() => handleItemClick(stageData.stageId, stageData.linkId, item)}
                                  />
                                </div>
                              ))}
                            </div>
                            
                            {/* 添加事项按钮 */}
                            {stageData.linkId && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-dashed border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 text-xs"
                                onClick={() => handleAddItem(stageData.stageId, stageData.linkId)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                添加事项
                              </Button>
                            )}
                            
                            {/* 空状态提示 */}
                            {stageData.items.length === 0 && !stageData.linkId && (
                              <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs">
                                暂无事项
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HorizontalGanttChart;
