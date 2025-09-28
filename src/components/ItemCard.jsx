import React from 'react';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  Users, 
  Calendar, 
  Flag, 
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { ItemStatus } from '../types/index.js';

const ItemCard = ({ item, onClick, linkColor }) => {
  // 获取状态相关的样式和图标
  const getStatusInfo = (status) => {
    switch (status) {
      case ItemStatus.TODO:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <AlertTriangle className="h-3 w-3" />,
          text: '待办'
        };
      case ItemStatus.IN_PROGRESS:
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Clock className="h-3 w-3" />,
          text: '进行中'
        };
      case ItemStatus.DONE:
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircle className="h-3 w-3" />,
          text: '已完成'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <AlertTriangle className="h-3 w-3" />,
          text: '未知'
        };
    }
  };

  // 获取优先级相关的样式
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'high':
        return {
          color: 'bg-red-100 text-red-800 border-red-300',
          text: '高'
        };
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          text: '中'
        };
      case 'low':
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          text: '低'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          text: '中'
        };
    }
  };

  const statusInfo = getStatusInfo(item.status);
  const priorityInfo = getPriorityInfo(item.priority);

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // 计算是否逾期
  const isOverdue = () => {
    if (!item.endDate || item.status === ItemStatus.DONE) return false;
    return new Date(item.endDate) < new Date();
  };

  return (
    <div
      className="bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg p-4 hover:shadow-md dark:hover:shadow-slate-900/20 transition-all duration-300 cursor-pointer group item-card card-hover"
      onClick={onClick}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: linkColor
      }}
    >
      {/* 事项标题和状态 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-2">
            {item.description}
          </h4>
          {item.notes && (
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
              {item.notes}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          {/* 状态标签 */}
          <Badge 
            className={`text-xs ${statusInfo.color} flex items-center gap-1`}
            variant="outline"
          >
            {statusInfo.icon}
            {statusInfo.text}
          </Badge>

          {/* 优先级标签 */}
          <Badge 
            className={`text-xs ${priorityInfo.color} flex items-center gap-1`}
            variant="outline"
          >
            <Flag className="h-3 w-3" />
            {priorityInfo.text}
          </Badge>
        </div>
      </div>

      {/* 参与人员 */}
      {item.participants && item.participants.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Users className="h-3 w-3" />
          <span className="truncate">
            {item.participants.join(', ')}
          </span>
        </div>
      )}

      {/* 日期信息 */}
      {(item.startDate || item.endDate) && (
        <div className="flex items-center gap-4 mb-3 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3 w-3" />
          <div className="flex gap-3">
            {item.startDate && (
              <span>开始: {formatDate(item.startDate)}</span>
            )}
            {item.endDate && (
              <span className={isOverdue() ? 'text-red-600 font-medium' : ''}>
                结束: {formatDate(item.endDate)}
                {isOverdue() && ' (逾期)'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 备注信息 */}
      {item.notes && (
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700 rounded p-2">
          <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div className="text-xs leading-relaxed">
            {item.notes.length > 100 
              ? `${item.notes.substring(0, 100)}...` 
              : item.notes
            }
          </div>
        </div>
      )}

      {/* 逾期警告 */}
      {isOverdue() && (
        <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">
          <AlertTriangle className="h-3 w-3" />
          <span>该事项已逾期</span>
        </div>
      )}

      {/* 悬停效果指示器 */}
      <div className="mt-3 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-xs text-gray-400 text-center">
          点击编辑事项详情
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
