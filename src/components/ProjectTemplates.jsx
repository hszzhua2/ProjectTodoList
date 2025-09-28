import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { 
  FileText, 
  Building2, 
  Hospital, 
  Factory,
  Home,
  Download,
  Eye,
  CheckCircle
} from 'lucide-react';
import { Project, ProjectStage, Link, Item, DEFAULT_STAGES, DEFAULT_LINKS } from '../types/index.js';
import { projectService } from '../services/ProjectService.js';

const ProjectTemplates = ({ 
  isOpen, 
  onClose, 
  onTemplateSelect 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 预定义的项目模板
  const templates = [
    {
      id: 'hospital-comprehensive',
      name: '综合医院建设项目',
      description: '适用于大型综合医院的建设项目，包含完整的医疗工艺流程和设备配置',
      icon: <Hospital className="h-8 w-8 text-blue-600" />,
      category: '医疗建筑',
      stages: 10,
      links: 6,
      estimatedItems: 45,
      features: [
        '完整的医疗工艺设计',
        '手术室洁净系统',
        '医用气体系统',
        'HIS/LIS/PACS集成',
        '感染控制流程',
        '应急预案设计'
      ]
    },
    {
      id: 'hospital-specialized',
      name: '专科医院建设项目',
      description: '适用于专科医院（如肿瘤医院、心血管医院等）的建设项目',
      icon: <Building2 className="h-8 w-8 text-green-600" />,
      category: '医疗建筑',
      stages: 8,
      links: 6,
      estimatedItems: 32,
      features: [
        '专科医疗工艺',
        '特殊设备配置',
        '专业净化系统',
        '科研实验室',
        '教学培训区域'
      ]
    },
    {
      id: 'hospital-community',
      name: '社区医院建设项目',
      description: '适用于社区卫生服务中心和小型医院的建设项目',
      icon: <Home className="h-8 w-8 text-purple-600" />,
      category: '医疗建筑',
      stages: 6,
      links: 5,
      estimatedItems: 20,
      features: [
        '基础医疗功能',
        '预防保健服务',
        '家庭医生工作站',
        '健康管理中心',
        '便民服务设施'
      ]
    },
    {
      id: 'hospital-renovation',
      name: '医院改扩建项目',
      description: '适用于现有医院的改造和扩建项目',
      icon: <Factory className="h-8 w-8 text-orange-600" />,
      category: '改扩建',
      stages: 7,
      links: 6,
      estimatedItems: 28,
      features: [
        '现状调研评估',
        '分期施工方案',
        '运营期间施工',
        '系统升级改造',
        '功能优化调整'
      ]
    }
  ];

  // 生成模板项目数据
  const generateTemplateProject = (template) => {
    const project = new Project({
      name: template.name,
      description: template.description
    });

    // 根据模板类型调整阶段
    let stageNames = [...DEFAULT_STAGES];
    if (template.id === 'hospital-community') {
      // 社区医院简化阶段
      stageNames = ['立项', '方案设计', '施工图设计', '施工阶段', '竣工验收', '运营维护'];
    } else if (template.id === 'hospital-renovation') {
      // 改扩建项目特殊阶段
      stageNames = ['现状调研', '改造方案', '施工图设计', '分期施工', '系统调试', '验收移交', '运营维护'];
    }

    stageNames.forEach((stageName, stageIndex) => {
      const stage = new ProjectStage({
        name: stageName,
        description: `${stageName}阶段的相关工作`
      });

      // 根据模板类型调整链路
      let linkData = [...DEFAULT_LINKS];
      if (template.id === 'hospital-community') {
        // 社区医院简化链路
        linkData = linkData.slice(0, 5); // 只保留前5个链路
      }

      linkData.forEach(link => {
        const projectLink = new Link({
          name: link.name,
          owner: link.owner
        });

        // 根据模板和阶段添加示例事项
        const sampleItems = generateSampleItems(template.id, stageName, link.name);
        sampleItems.forEach(itemData => {
          const item = new Item(itemData);
          projectLink.addItem(item);
        });

        stage.addLink(projectLink);
      });

      project.addStage(stage);
    });

    return project;
  };

  // 生成示例事项
  const generateSampleItems = (templateId, stageName, linkName) => {
    const items = [];

    // 根据不同的模板、阶段和链路生成相应的示例事项
    if (stageName === '立项' && linkName === '需求生成链') {
      items.push({
        description: '医疗工艺需求前置',
        participants: ['规划', '建筑', '医疗工艺咨询'],
        status: 'todo',
        priority: 'high',
        notes: '确定医院的功能需求和工艺流程'
      });

      if (templateId === 'hospital-comprehensive') {
        items.push({
          description: '专科科室需求调研',
          participants: ['医疗工艺咨询', '临床专家', '医院方'],
          status: 'todo',
          priority: 'high',
          notes: '调研各专科科室的特殊需求'
        });
      }
    }

    if (stageName === '施工图阶段' && linkName === '设计转化链') {
      items.push({
        description: '医用气体系统设计',
        participants: ['机电', '医疗工艺', '设备供应商'],
        status: 'todo',
        priority: 'medium',
        notes: '设计中心供氧、负压吸引等系统'
      });

      if (templateId !== 'hospital-community') {
        items.push({
          description: '洁净手术室设计',
          participants: ['建筑', '机电', '净化专业'],
          status: 'todo',
          priority: 'high',
          notes: '设计符合规范的洁净手术室'
        });
      }
    }

    if (stageName === '施工阶段' && linkName === '施工控制链') {
      items.push({
        description: '医疗设备安装调试',
        participants: ['设备供应商', '施工方', '监理方'],
        status: 'todo',
        priority: 'medium',
        notes: '安装和调试医疗设备'
      });
    }

    return items;
  };

  // 应用模板
  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      const templateProject = generateTemplateProject(selectedTemplate);
      projectService.loadProjectData(templateProject.toJSON());
      
      if (onTemplateSelect) {
        onTemplateSelect(templateProject);
      }
      
      onClose();
    } catch (error) {
      console.error('应用模板失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 预览模板
  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            项目模板
          </DialogTitle>
          <DialogDescription>
            选择适合的项目模板快速创建新项目
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* 模板列表 */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">可用模板</h3>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-4">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : ''
                    }`}
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        {template.icon}
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            {template.name}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {template.category}
                          </Badge>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 mb-3">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{template.stages} 个阶段</span>
                        <span>{template.links} 个链路</span>
                        <span>约 {template.estimatedItems} 个事项</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* 模板详情 */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">模板详情</h3>
            {selectedTemplate ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {selectedTemplate.icon}
                    <div>
                      <CardTitle className="text-lg">
                        {selectedTemplate.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {selectedTemplate.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">项目描述</h4>
                    <p className="text-sm text-gray-600">
                      {selectedTemplate.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">项目规模</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-lg font-bold text-blue-600">
                          {selectedTemplate.stages}
                        </div>
                        <div className="text-xs text-gray-600">阶段</div>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-lg font-bold text-green-600">
                          {selectedTemplate.links}
                        </div>
                        <div className="text-xs text-gray-600">链路</div>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-lg font-bold text-purple-600">
                          {selectedTemplate.estimatedItems}
                        </div>
                        <div className="text-xs text-gray-600">事项</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">主要特性</h4>
                    <div className="space-y-1">
                      {selectedTemplate.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-[400px] text-gray-500">
                  <div className="text-center">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>选择一个模板查看详情</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={handleApplyTemplate}
            disabled={!selectedTemplate || isLoading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isLoading ? '应用中...' : '应用模板'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectTemplates;
