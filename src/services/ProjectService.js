import { Project, ProjectStage, Link, Item, DEFAULT_STAGES, DEFAULT_LINKS } from '../types/index.js';

/**
 * 项目服务类
 * 负责项目数据的管理，包括加载、保存、添加、删除阶段和链路
 */
export class ProjectService {
  constructor() {
    this.currentProject = null;
    this.storageKey = 'hospital-project-manager-data';
  }

  /**
   * 创建默认项目
   */
  createDefaultProject() {
    const project = new Project({
      name: '医院建设项目',
      description: '医院工程项目全生命周期管理',
      startDate: new Date().toISOString().split('T')[0],
      endDate: null
    });

    // 添加默认阶段
    DEFAULT_STAGES.forEach((stageName, index) => {
      const stage = new ProjectStage({
        name: stageName,
        description: `${stageName}阶段的相关工作`
      });

      // 为每个阶段添加默认链路
      DEFAULT_LINKS.forEach(linkData => {
        const link = new Link({
          name: linkData.name,
          owner: linkData.owner
        });
        stage.addLink(link);
      });

      project.addStage(stage);
    });

    // 添加一些示例事项
    this.addSampleItems(project);

    this.currentProject = project;
    this.saveToLocalStorage();
    return project;
  }

  /**
   * 添加示例事项
   */
  addSampleItems(project) {
    if (project.stages.length > 0) {
      const firstStage = project.stages[0]; // 立项阶段
      if (firstStage.links.length > 0) {
        const needsLink = firstStage.links[0]; // 需求生成链
        
        // 添加示例事项
        const sampleItem = new Item({
          description: '医疗工艺需求前置',
          participants: ['规划', '建筑', '医疗工艺咨询'],
          status: 'todo',
          priority: 'high',
          notes: '确定医院的功能需求和工艺流程'
        });
        
        needsLink.addItem(sampleItem);
      }
    }
  }

  /**
   * 从JSON数据加载项目
   */
  loadProjectData(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      this.currentProject = Project.fromJSON(data);
      this.saveToLocalStorage();
      return this.currentProject;
    } catch (error) {
      console.error('加载项目数据失败:', error);
      throw new Error('无效的JSON数据格式');
    }
  }

  /**
   * 导出项目数据为JSON
   */
  exportProjectData() {
    if (!this.currentProject) {
      throw new Error('没有可导出的项目数据');
    }
    return JSON.stringify(this.currentProject.toJSON(), null, 2);
  }

  /**
   * 获取当前项目
   */
  getCurrentProject() {
    if (!this.currentProject) {
      this.loadFromLocalStorage() || this.createDefaultProject();
    }
    return this.currentProject;
  }

  /**
   * 添加阶段
   */
  addStage(stageData) {
    if (!this.currentProject) {
      this.getCurrentProject();
    }
    
    const stage = stageData instanceof ProjectStage ? stageData : new ProjectStage(stageData);
    this.currentProject.addStage(stage);
    this.saveToLocalStorage();
    return stage;
  }

  /**
   * 删除阶段
   */
  removeStage(stageId) {
    if (!this.currentProject) return false;
    
    this.currentProject.removeStage(stageId);
    this.saveToLocalStorage();
    return true;
  }

  /**
   * 更新阶段
   */
  updateStage(updatedStage) {
    if (!this.currentProject) return false;
    
    this.currentProject.updateStage(updatedStage);
    this.saveToLocalStorage();
    return true;
  }

  /**
   * 获取阶段
   */
  getStage(stageId) {
    if (!this.currentProject) return null;
    return this.currentProject.getStage(stageId);
  }

  /**
   * 添加链路到指定阶段
   */
  addLink(stageId, linkData) {
    const stage = this.getStage(stageId);
    if (!stage) return null;
    
    const link = linkData instanceof Link ? linkData : new Link(linkData);
    stage.addLink(link);
    this.saveToLocalStorage();
    return link;
  }

  /**
   * 从指定阶段删除链路
   */
  removeLink(stageId, linkId) {
    const stage = this.getStage(stageId);
    if (!stage) return false;
    
    stage.removeLink(linkId);
    this.saveToLocalStorage();
    return true;
  }

  /**
   * 更新链路
   */
  updateLink(stageId, updatedLink) {
    const stage = this.getStage(stageId);
    if (!stage) return false;
    
    stage.updateLink(updatedLink);
    this.saveToLocalStorage();
    return true;
  }

  /**
   * 获取链路
   */
  getLink(stageId, linkId) {
    const stage = this.getStage(stageId);
    if (!stage) return null;
    return stage.getLink(linkId);
  }

  /**
   * 获取所有项目阶段
   */
  getProjectStages() {
    const project = this.getCurrentProject();
    return project ? project.stages : [];
  }

  /**
   * 保存到本地存储
   */
  saveToLocalStorage() {
    if (this.currentProject) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.currentProject.toJSON()));
      } catch (error) {
        console.error('保存到本地存储失败:', error);
      }
    }
  }

  /**
   * 从本地存储加载
   */
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.currentProject = Project.fromJSON(JSON.parse(data));
        return this.currentProject;
      }
    } catch (error) {
      console.error('从本地存储加载失败:', error);
    }
    return null;
  }

  /**
   * 清除本地存储
   */
  clearLocalStorage() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('清除本地存储失败:', error);
    }
  }

  /**
   * 重置项目为默认状态
   */
  resetProject() {
    this.clearLocalStorage();
    this.currentProject = null;
    return this.createDefaultProject();
  }
}

// 创建单例实例
export const projectService = new ProjectService();
