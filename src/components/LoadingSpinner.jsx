import React from 'react';
import { Loader2, Building2, Clock, CheckCircle } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = '加载中...', 
  type = 'default',
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'project':
        return <Building2 className={`${getSizeClasses()} animate-pulse`} />;
      case 'time':
        return <Clock className={`${getSizeClasses()} animate-spin`} />;
      case 'success':
        return <CheckCircle className={`${getSizeClasses()} text-green-600`} />;
      default:
        return <Loader2 className={`${getSizeClasses()} animate-spin`} />;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      default:
        return 'text-sm';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="flex items-center justify-center">
        {getIcon()}
      </div>
      {text && (
        <div className={`${getTextSize()} text-gray-600 font-medium animate-pulse`}>
          {text}
        </div>
      )}
    </div>
  );
};

// 骨架加载组件
export const SkeletonLoader = ({ 
  lines = 3, 
  className = '',
  showAvatar = false 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={`h-4 bg-gray-200 rounded ${
                index === lines - 1 ? 'w-3/4' : 'w-full'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 卡片骨架加载组件
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white border rounded-lg p-4 animate-pulse ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-16 h-6 bg-gray-200 rounded"></div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="w-8 h-6 bg-gray-200 rounded"></div>
        <div className="w-8 h-6 bg-gray-200 rounded"></div>
        <div className="w-8 h-6 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

// 甘特图骨架加载组件
export const GanttSkeleton = ({ stages = 3, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: stages }).map((_, stageIndex) => (
        <div key={stageIndex} className="bg-white border rounded-lg animate-pulse">
          {/* 阶段标题骨架 */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="w-1 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="w-16 h-5 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          
          {/* 进度条骨架 */}
          <div className="px-4 py-2">
            <div className="w-full h-2 bg-gray-200 rounded"></div>
          </div>
          
          {/* 链路骨架 */}
          <div className="p-4 space-y-3">
            {Array.from({ length: 2 }).map((_, linkIndex) => (
              <div key={linkIndex} className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                    <div className="w-12 h-5 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-200 rounded"></div>
                </div>
                
                <div className="w-full h-2 bg-gray-200 rounded mb-3"></div>
                
                {/* 事项骨架 */}
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, itemIndex) => (
                    <CardSkeleton key={itemIndex} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 页面加载覆盖层
export const PageLoader = ({ text = '正在加载项目数据...', isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="mb-6">
          <Building2 className="w-16 h-16 mx-auto text-blue-600 animate-bounce" />
        </div>
        <LoadingSpinner size="large" text={text} type="project" />
        <div className="mt-4 text-xs text-gray-500">
          医院项目管理系统正在为您准备数据...
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
