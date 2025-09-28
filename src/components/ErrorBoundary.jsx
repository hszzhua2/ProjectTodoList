import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // 这里可以添加错误日志上报
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ isRetrying: true });
    
    // 延迟重置状态，给用户反馈
    setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        isRetrying: false
      });
    }, 1000);
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                系统遇到了问题
              </CardTitle>
              <p className="text-gray-600 mt-2">
                很抱歉，医院项目管理系统遇到了意外错误。我们已经记录了这个问题。
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* 错误详情（开发模式下显示） */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    错误详情
                  </h3>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div>
                      <strong>错误信息:</strong>
                      <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>组件堆栈:</strong>
                        <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 用户友好的错误信息 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">可能的解决方案：</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 尝试刷新页面</li>
                  <li>• 检查网络连接是否正常</li>
                  <li>• 清除浏览器缓存后重试</li>
                  <li>• 如果问题持续存在，请联系技术支持</li>
                </ul>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                  {this.state.isRetrying ? '重试中...' : '重试'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  刷新页面
                </Button>
              </div>

              {/* 联系信息 */}
              <div className="text-center text-sm text-gray-500">
                <p>如果问题持续存在，请记录错误信息并联系技术支持</p>
                <p className="mt-1">错误ID: {Date.now().toString(36)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// 函数式错误组件，用于特定场景
export const ErrorMessage = ({ 
  title = '出现错误', 
  message = '请稍后重试', 
  onRetry,
  showRetry = true,
  className = '' 
}) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          重试
        </Button>
      )}
    </div>
  );
};

// 网络错误组件
export const NetworkError = ({ onRetry }) => {
  return (
    <ErrorMessage
      title="网络连接错误"
      message="无法连接到服务器，请检查网络连接后重试"
      onRetry={onRetry}
    />
  );
};

// 数据加载错误组件
export const DataLoadError = ({ onRetry }) => {
  return (
    <ErrorMessage
      title="数据加载失败"
      message="无法加载项目数据，请稍后重试"
      onRetry={onRetry}
    />
  );
};

export default ErrorBoundary;
