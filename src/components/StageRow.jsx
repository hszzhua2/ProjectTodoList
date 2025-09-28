import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  Clock, 
  BarChart3,
  Plus,
  Settings
} from 'lucide-react';
import { ItemStatus } from '../types/index.js';
import LinkRow from './LinkRow.jsx';

const StageRow = ({ 
  stage, 
  isExpanded, 
  onToggleExpansion, 
  onItemClick, 
  onAddItem,
  onEditStage 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // 计算阶段统计信息
  const getStageStatistics = () => {
    let totalItems = 0;
    let completedItems = 0;
    let inProgressItems = 0;
    let todoItems = 0;

    stage.links.forEach(link => {
      link.items.forEach(item => {
        totalItems++;
        switch (item.status) {
          case ItemStatus.DONE:
            completedItems++;
            break;
          case ItemStatus.IN_PROGRESS:
            inProgressItems++;
            break;
          case ItemStatus.TODO:
            todoItems++;
            break;
        }
      });
    });

    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      totalItems,
      completedItems,
      inProgressItems,
      todoItems,
      progress
    };
  };

  const stats = getStageStatistics();

  const getStatusColor = (progress) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    if (progress >= 20) return 'text-blue-600';
    return 'text-gray-600';
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('zh-CN');
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="mb-4 overflow-hidden enhanced-card gantt-stage">
      {/* 阶段标题栏 */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 status-indicator"
        onClick={onToggleExpansion}
      >
        <div className="flex items-center gap-4 flex-1">
          {/* 展开/折叠图标 */}
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            )}
            <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
          </div>

          {/* 阶段信息 */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {stage.name}
              </h3>
              <Badge variant="outline" className="text-xs">
                {stage.links.length} 个链路
              </Badge>
              <Badge variant="outline" className="text-xs">
                {stats.totalItems} 个事项
              </Badge>
            </div>

            {/* 进度信息 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4" />
                <span className={`font-medium ${getStatusColor(stats.progress)}`}>
                  进度: {stats.progress}%
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>已完成: {stats.completedItems}</span>
                <span>进行中: {stats.inProgressItems}</span>
                <span>待办: {stats.todoItems}</span>
              </div>
            </div>
          </div>

          {/* 日期信息 */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {(stage.startDate || stage.endDate) && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <div className="text-right">
                  {stage.startDate && (
                    <div>开始: {formatDate(stage.startDate)}</div>
                  )}
                  {stage.endDate && (
                    <div>结束: {formatDate(stage.endDate)}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="h-8 px-2"
          >
            <Clock className="h-4 w-4" />
          </Button>
          
          {onEditStage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditStage(stage);
              }}
              className="h-8 px-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 进度条 */}
      <div className="px-4 pb-2">
        <Progress value={stats.progress} className="h-2 progress-bar" />
      </div>

      {/* 阶段详情（可选显示） */}
      {showDetails && (
        <div className="px-4 pb-4 bg-gray-50 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">阶段信息</h5>
              <div className="space-y-1 text-gray-600">
                <div>阶段名称: {stage.name}</div>
                {stage.description && (
                  <div>描述: {stage.description}</div>
                )}
                <div>状态: {stage.status || '计划中'}</div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-700 mb-2">统计信息</h5>
              <div className="space-y-1 text-gray-600">
                <div>链路数量: {stage.links.length}</div>
                <div>事项总数: {stats.totalItems}</div>
                <div>完成率: {stats.progress}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 链路内容 */}
      {isExpanded && (
        <CardContent className="p-0">
          <div className="space-y-3 p-4">
            {stage.links.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm mb-2">该阶段暂无链路</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // 这里可以添加创建链路的逻辑
                    console.log('创建新链路');
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  添加链路
                </Button>
              </div>
            ) : (
              stage.links.map((link, index) => (
                <LinkRow
                  key={link.id}
                  link={link}
                  stageId={stage.id}
                  index={index}
                  onItemClick={onItemClick}
                  onAddItem={onAddItem}
                />
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default StageRow;
