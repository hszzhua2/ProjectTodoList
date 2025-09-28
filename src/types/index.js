// 数据模型类型定义

/**
 * 事项状态枚举
 */
export const ItemStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done'
};

/**
 * 事项 (Item) 数据模型
 * 代表项目中的具体任务或事件
 */
export class Item {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.description = data.description || '';
    this.participants = data.participants || [];
    this.status = data.status || ItemStatus.TODO;
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.priority = data.priority || 'medium';
    this.notes = data.notes || '';
  }

  generateId() {
    return 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      description: this.description,
      participants: this.participants,
      status: this.status,
      startDate: this.startDate,
      endDate: this.endDate,
      priority: this.priority,
      notes: this.notes
    };
  }

  static fromJSON(data) {
    return new Item(data);
  }
}

/**
 * 链路 (Link) 数据模型
 * 代表项目管理中的六大链路之一
 */
export class Link {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.owner = data.owner || '';
    this.items = (data.items || []).map(item => 
      item instanceof Item ? item : Item.fromJSON(item)
    );
    this.color = data.color || this.getDefaultColor();
  }

  generateId() {
    return 'link-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  getDefaultColor() {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  addItem(item) {
    this.items.push(item instanceof Item ? item : Item.fromJSON(item));
  }

  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
  }

  getItem(itemId) {
    return this.items.find(item => item.id === itemId);
  }

  updateItem(updatedItem) {
    const index = this.items.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      this.items[index] = updatedItem instanceof Item ? updatedItem : Item.fromJSON(updatedItem);
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      owner: this.owner,
      color: this.color,
      items: this.items.map(item => item.toJSON())
    };
  }

  static fromJSON(data) {
    return new Link(data);
  }
}

/**
 * 项目阶段 (ProjectStage) 数据模型
 * 代表项目生命周期中的一个阶段
 */
export class ProjectStage {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.links = (data.links || []).map(link => 
      link instanceof Link ? link : Link.fromJSON(link)
    );
    this.description = data.description || '';
    this.status = data.status || 'planned';
  }

  generateId() {
    return 'stage-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  addLink(link) {
    this.links.push(link instanceof Link ? link : Link.fromJSON(link));
  }

  removeLink(linkId) {
    this.links = this.links.filter(link => link.id !== linkId);
  }

  getLink(linkId) {
    return this.links.find(link => link.id === linkId);
  }

  updateLink(updatedLink) {
    const index = this.links.findIndex(link => link.id === updatedLink.id);
    if (index !== -1) {
      this.links[index] = updatedLink instanceof Link ? updatedLink : Link.fromJSON(updatedLink);
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      startDate: this.startDate,
      endDate: this.endDate,
      description: this.description,
      status: this.status,
      links: this.links.map(link => link.toJSON())
    };
  }

  static fromJSON(data) {
    return new ProjectStage(data);
  }
}

/**
 * 项目 (Project) 数据模型
 * 代表整个医院项目
 */
export class Project {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '医院建设项目';
    this.description = data.description || '';
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.stages = (data.stages || []).map(stage => 
      stage instanceof ProjectStage ? stage : ProjectStage.fromJSON(stage)
    );
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateId() {
    return 'project-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  addStage(stage) {
    this.stages.push(stage instanceof ProjectStage ? stage : ProjectStage.fromJSON(stage));
    this.updatedAt = new Date().toISOString();
  }

  removeStage(stageId) {
    this.stages = this.stages.filter(stage => stage.id !== stageId);
    this.updatedAt = new Date().toISOString();
  }

  getStage(stageId) {
    return this.stages.find(stage => stage.id === stageId);
  }

  updateStage(updatedStage) {
    const index = this.stages.findIndex(stage => stage.id === updatedStage.id);
    if (index !== -1) {
      this.stages[index] = updatedStage instanceof ProjectStage ? updatedStage : ProjectStage.fromJSON(updatedStage);
      this.updatedAt = new Date().toISOString();
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      stages: this.stages.map(stage => stage.toJSON())
    };
  }

  static fromJSON(data) {
    return new Project(data);
  }
}

// 预定义的项目阶段名称
export const DEFAULT_STAGES = [
  '立项与可研',
  '初设前阶段',
  '方案、初设阶段',
  '施工图阶段',
  '施工图-招标阶段',
  '施工阶段',
  '竣工验收阶段',
  '竣工-开办前阶段',
  '运营维护阶段'
];

// 预定义的六大链路
export const DEFAULT_LINKS = [
  { name: '需求生成链', owner: '医院方主管' },
  { name: '设计转化链', owner: '代建方主管' },
  { name: '采购集成链', owner: '医院方主管' },
  { name: '施工控制链', owner: '代建方主管' },
  { name: '运营对接链', owner: '医院方主管' },
  { name: '持续优化链', owner: '医管中心主管' }
];
