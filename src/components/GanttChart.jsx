import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { Calendar, AlertCircle } from 'lucide-react';
import { projectService } from '../services/ProjectService.js';
import StageRow from './StageRow.jsx';
import LoadingSpinner, { GanttSkeleton } from './LoadingSpinner.jsx';
import { ErrorMessage } from './ErrorBoundary.jsx';

const GanttChart = ({ onItemClick, onAddItem }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStages, setExpandedStages] = useState(new Set());

  useEffect(() => {
    loadProjectData();
  }, []);

  const loadProjectData = async () => {
    setLoading(true);
    setError(null);
    try {
      const projectData = await projectService.getCurrentProject();
      setProject(projectData);
      
      // 默认展开第一个阶段
      if (projectData.stages && projectData.stages.length > 0) {
        setExpandedStages(new Set([projectData.stages[0].id]));
      }
    } catch (err) {
      console.error('加载项目数据失败:', err);
      setError(err.message || '加载项目数据失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleStageExpansion = (stageId) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
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

  if (loading) {
    return (
      <div className="gantt-container">
        <div className="gantt-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">项目甘特图</h2>
                <p className="text-sm text-gray-600">正在加载项目数据...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="gantt-content">
          <GanttSkeleton stages={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gantt-container">
        <div className="gantt-header">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">项目甘特图</h2>
              <p className="text-sm text-gray-600">项目阶段和链路管理</p>
            </div>
          </div>
        </div>
        <div className="gantt-content">
          <ErrorMessage
            title="数据加载失败"
            message={error}
            onRetry={loadProjectData}
          />
        </div>
      </div>
    );
  }

  if (!project || !project.stages || project.stages.length === 0) {
    return (
      <div className="gantt-container">
        <div className="gantt-header">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">项目甘特图</h2>
              <p className="text-sm text-gray-600">项目阶段和链路管理</p>
            </div>
          </div>
        </div>
        <div className="gantt-content">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无项目数据</h3>
            <p className="text-gray-600 mb-4">请导入项目数据或使用模板创建新项目</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full fade-in">
      <Card className="enhanced-card">
        <CardHeader className="gantt-header border-b">
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {project.name || '医院建设项目'}
              </h2>
              {project.description && (
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] w-full custom-scrollbar">
            <div className="space-y-4 p-6">
              {project.stages.map((stage, index) => (
                <div key={stage.id} className="slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <StageRow
                    stage={stage}
                    isExpanded={expandedStages.has(stage.id)}
                    onToggleExpansion={() => toggleStageExpansion(stage.id)}
                    onItemClick={handleItemClick}
                    onAddItem={handleAddItem}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default GanttChart;
