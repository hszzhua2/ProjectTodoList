import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { 
  Plus, 
  Users, 
  Target, 
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';
import { ItemStatus } from '../types/index.js';
import ItemCard from './ItemCard.jsx';

const LinkRow = ({ 
  link, 
  stageId, 
  index, 
  onItemClick, 
  onAddItem 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllItems, setShowAllItems] = useState(false);

  // 计算链路统计信息
  const getLinkStatistics = () => {
    const totalItems = link.items.length;
    const completedItems = link.items.filter(item => item.status === ItemStatus.DONE).length;
    const inProgressItems = link.items.filter(item => item.status === ItemStatus.IN_PROGRESS).length;
    const todoItems = link.items.filter(item => item.status === ItemStatus.TODO).length;
    
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      totalItems,
      completedItems,
      inProgressItems,
      todoItems,
      progress
    };
  };

  const stats = getLinkStatistics();

  // 获取链路颜色
  const getLinkColor = () => {
    return link.color || '#3B82F6';
  };

  // 获取显示的事项列表
  const getDisplayItems = () => {
    if (showAllItems || link.items.length <= 3) {
      return link.items;
    }
    return link.items.slice(0, 3);
  };

  const handleAddItem = () => {
    if (onAddItem) {
      onAddItem(stageId, link.id);
    }
  };

  const handleItemClick = (item) => {
    if (onItemClick) {
      onItemClick(stageId, link.id, item);
    }
  };

  return (
    <div 
      className="border-l-4 pl-4 py-3 bg-white rounded-r-lg shadow-sm hover:shadow-md transition-all duration-300 gantt-link"
      style={{ borderLeftColor: getLinkColor() }}
    >
      {/* 链路标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {/* 链路信息 */}
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getLinkColor() }}
            ></div>
            <h4 className="font-medium text-gray-900 text-lg">
              {link.name}
            </h4>
          </div>

          {/* 主管信息 */}
          <Badge 
            variant="secondary" 
            className="text-xs flex items-center gap-1"
          >
            <Users className="h-3 w-3" />
            {link.owner}
          </Badge>

          {/* 统计信息 */}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{stats.totalItems} 项</span>
            </div>
            
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{stats.completedItems}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>{stats.inProgressItems}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-gray-500" />
              <span>{stats.todoItems}</span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {/* 进度显示 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">进度:</span>
            <span 
              className="font-medium"
              style={{ color: getLinkColor() }}
            >
              {stats.progress}%
            </span>
          </div>

          {/* 展开/折叠按钮 */}
          {link.items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}

          {/* 添加事项按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="h-8 px-3 gap-1"
          >
            <Plus className="h-3 w-3" />
            添加事项
          </Button>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-4">
        <Progress 
          value={stats.progress} 
          className="h-2"
          style={{
            '--progress-background': getLinkColor()
          }}
        />
      </div>

      {/* 事项列表 */}
      {isExpanded && (
        <div className="space-y-3">
          {link.items.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-sm mb-2">该链路暂无事项</div>
              <div className="text-xs text-gray-400">
                点击上方"添加事项"按钮创建第一个事项
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-3">
                {getDisplayItems().map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => handleItemClick(item)}
                    linkColor={getLinkColor()}
                  />
                ))}
              </div>

              {/* 显示更多按钮 */}
              {link.items.length > 3 && (
                <div className="text-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllItems(!showAllItems)}
                    className="text-xs gap-2"
                  >
                    {showAllItems ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        收起 ({link.items.length - 3} 项)
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        显示全部 ({link.items.length - 3} 项)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LinkRow;
