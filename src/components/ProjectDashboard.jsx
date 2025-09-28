import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Target,
  TrendingUp
} from 'lucide-react';
import { projectService } from '../services/ProjectService.js';
import { itemService } from '../services/ItemService.js';
import { ItemStatus } from '../types/index.js';

const ProjectDashboard = () => {
  const [project, setProject] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const currentProject = projectService.getCurrentProject();
      const stats = itemService.getItemStatistics();
      setProject(currentProject);
      setStatistics(stats);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageStatistics = () => {
    if (!project || !project.stages) return [];
    
    return project.stages.map(stage => {
      const allItems = [];
      stage.links.forEach(link => {
        allItems.push(...link.items);
      });
      
      const todoCount = allItems.filter(item => item.status === ItemStatus.TODO).length;
      const inProgressCount = allItems.filter(item => item.status === ItemStatus.IN_PROGRESS).length;
      const doneCount = allItems.filter(item => item.status === ItemStatus.DONE).length;
      const total = allItems.length;
      
      return {
        name: stage.name,
        total,
        todo: todoCount,
        inProgress: inProgressCount,
        done: doneCount,
        progress: total > 0 ? Math.round((doneCount / total) * 100) : 0
      };
    });
  };

  const getLinkStatistics = () => {
    if (!project || !project.stages) return [];
    
    const linkStats = {};
    
    project.stages.forEach(stage => {
      stage.links.forEach(link => {
        if (!linkStats[link.name]) {
          linkStats[link.name] = {
            name: link.name,
            owner: link.owner,
            total: 0,
            todo: 0,
            inProgress: 0,
            done: 0
          };
        }
        
        link.items.forEach(item => {
          linkStats[link.name].total++;
          if (item.status === ItemStatus.TODO) linkStats[link.name].todo++;
          else if (item.status === ItemStatus.IN_PROGRESS) linkStats[link.name].inProgress++;
          else if (item.status === ItemStatus.DONE) linkStats[link.name].done++;
        });
      });
    });
    
    return Object.values(linkStats);
  };

  const getStatusData = () => {
    if (!statistics) return [];
    
    return [
      { name: '待办', value: statistics.byStatus[ItemStatus.TODO], color: '#6B7280' },
      { name: '进行中', value: statistics.byStatus[ItemStatus.IN_PROGRESS], color: '#3B82F6' },
      { name: '已完成', value: statistics.byStatus[ItemStatus.DONE], color: '#10B981' }
    ];
  };

  const getPriorityData = () => {
    if (!statistics) return [];
    
    return [
      { name: '高优先级', value: statistics.byPriority.high, color: '#EF4444' },
      { name: '中优先级', value: statistics.byPriority.medium, color: '#F59E0B' },
      { name: '低优先级', value: statistics.byPriority.low, color: '#10B981' }
    ];
  };

  const getOverallProgress = () => {
    if (!statistics || statistics.total === 0) return 0;
    return Math.round((statistics.byStatus[ItemStatus.DONE] / statistics.total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  const stageStats = getStageStatistics();
  const linkStats = getLinkStatistics();
  const statusData = getStatusData();
  const priorityData = getPriorityData();
  const overallProgress = getOverallProgress();

  return (
    <div className="space-y-6">
      {/* 总体概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总事项数</p>
                <p className="text-2xl font-bold">{statistics?.total || 0}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-green-600">
                  {statistics?.byStatus[ItemStatus.DONE] || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">进行中</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statistics?.byStatus[ItemStatus.IN_PROGRESS] || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">整体进度</p>
                <p className="text-2xl font-bold text-purple-600">{overallProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 进度条 */}
      <Card>
        <CardHeader>
          <CardTitle>项目整体进度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>完成进度</span>
              <span>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>已完成 {statistics?.byStatus[ItemStatus.DONE] || 0} 项</span>
              <span>共 {statistics?.total || 0} 项</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 阶段进度图表 */}
        <Card>
          <CardHeader>
            <CardTitle>各阶段进度</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="done" stackId="a" fill="#10B981" name="已完成" />
                <Bar dataKey="inProgress" stackId="a" fill="#3B82F6" name="进行中" />
                <Bar dataKey="todo" stackId="a" fill="#6B7280" name="待办" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 状态分布饼图 */}
        <Card>
          <CardHeader>
            <CardTitle>事项状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 链路统计 */}
      <Card>
        <CardHeader>
          <CardTitle>六大链路统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {linkStats.map((link, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{link.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {link.owner}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    总计: {link.total} 项
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded"></div>
                    <span>待办: {link.todo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>进行中: {link.inProgress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>已完成: {link.done}</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <Progress 
                    value={link.total > 0 ? (link.done / link.total) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDashboard;
