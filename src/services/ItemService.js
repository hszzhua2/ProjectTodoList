import { Item, ItemStatus } from '../types/index.js';
import { projectService } from './ProjectService.js';

/**
 * 事项服务类
 * 负责事项的管理，包括添加、编辑、删除事项
 */
export class ItemService {
  constructor() {
    this.projectService = projectService;
  }

  /**
   * 添加事项到指定链路
   */
  addItem(stageId, linkId, itemData) {
    const link = this.projectService.getLink(stageId, linkId);
    if (!link) {
      throw new Error('找不到指定的链路');
    }

    const item = itemData instanceof Item ? itemData : new Item(itemData);
    link.addItem(item);
    this.projectService.saveToLocalStorage();
    return item;
  }

  /**
   * 更新事项
   */
  updateItem(stageId, linkId, updatedItem) {
    const link = this.projectService.getLink(stageId, linkId);
    if (!link) {
      throw new Error('找不到指定的链路');
    }

    const item = updatedItem instanceof Item ? updatedItem : new Item(updatedItem);
    link.updateItem(item);
    this.projectService.saveToLocalStorage();
    return item;
  }

  /**
   * 删除事项
   */
  deleteItem(stageId, linkId, itemId) {
    const link = this.projectService.getLink(stageId, linkId);
    if (!link) {
      throw new Error('找不到指定的链路');
    }

    link.removeItem(itemId);
    this.projectService.saveToLocalStorage();
    return true;
  }

  /**
   * 获取事项
   */
  getItem(stageId, linkId, itemId) {
    const link = this.projectService.getLink(stageId, linkId);
    if (!link) {
      return null;
    }

    return link.getItem(itemId);
  }

  /**
   * 获取链路下的所有事项
   */
  getItemsByLink(stageId, linkId) {
    const link = this.projectService.getLink(stageId, linkId);
    if (!link) {
      return [];
    }

    return link.items;
  }

  /**
   * 获取阶段下的所有事项
   */
  getItemsByStage(stageId) {
    const stage = this.projectService.getStage(stageId);
    if (!stage) {
      return [];
    }

    const allItems = [];
    stage.links.forEach(link => {
      allItems.push(...link.items);
    });

    return allItems;
  }

  /**
   * 获取项目中的所有事项
   */
  getAllItems() {
    const project = this.projectService.getCurrentProject();
    if (!project) {
      return [];
    }

    const allItems = [];
    project.stages.forEach(stage => {
      stage.links.forEach(link => {
        allItems.push(...link.items);
      });
    });

    return allItems;
  }

  /**
   * 根据状态筛选事项
   */
  getItemsByStatus(status) {
    const allItems = this.getAllItems();
    return allItems.filter(item => item.status === status);
  }

  /**
   * 根据优先级筛选事项
   */
  getItemsByPriority(priority) {
    const allItems = this.getAllItems();
    return allItems.filter(item => item.priority === priority);
  }

  /**
   * 搜索事项（根据描述或参与者）
   */
  searchItems(keyword) {
    if (!keyword || keyword.trim() === '') {
      return this.getAllItems();
    }

    const allItems = this.getAllItems();
    const lowerKeyword = keyword.toLowerCase();

    return allItems.filter(item => {
      return (
        item.description.toLowerCase().includes(lowerKeyword) ||
        item.participants.some(participant => 
          participant.toLowerCase().includes(lowerKeyword)
        ) ||
        (item.notes && item.notes.toLowerCase().includes(lowerKeyword))
      );
    });
  }

  /**
   * 更新事项状态
   */
  updateItemStatus(stageId, linkId, itemId, newStatus) {
    const item = this.getItem(stageId, linkId, itemId);
    if (!item) {
      throw new Error('找不到指定的事项');
    }

    if (!Object.values(ItemStatus).includes(newStatus)) {
      throw new Error('无效的事项状态');
    }

    item.status = newStatus;
    this.updateItem(stageId, linkId, item);
    return item;
  }

  /**
   * 批量更新事项状态
   */
  batchUpdateItemStatus(items, newStatus) {
    if (!Object.values(ItemStatus).includes(newStatus)) {
      throw new Error('无效的事项状态');
    }

    const updatedItems = [];
    items.forEach(({ stageId, linkId, itemId }) => {
      try {
        const item = this.updateItemStatus(stageId, linkId, itemId, newStatus);
        updatedItems.push(item);
      } catch (error) {
        console.error(`更新事项 ${itemId} 状态失败:`, error);
      }
    });

    return updatedItems;
  }

  /**
   * 复制事项到其他链路
   */
  copyItem(sourceStageId, sourceLinkId, itemId, targetStageId, targetLinkId) {
    const sourceItem = this.getItem(sourceStageId, sourceLinkId, itemId);
    if (!sourceItem) {
      throw new Error('找不到源事项');
    }

    // 创建事项副本
    const itemCopy = new Item({
      ...sourceItem.toJSON(),
      id: undefined // 让系统生成新的ID
    });

    return this.addItem(targetStageId, targetLinkId, itemCopy);
  }

  /**
   * 移动事项到其他链路
   */
  moveItem(sourceStageId, sourceLinkId, itemId, targetStageId, targetLinkId) {
    // 先复制事项
    const copiedItem = this.copyItem(sourceStageId, sourceLinkId, itemId, targetStageId, targetLinkId);
    
    // 然后删除原事项
    this.deleteItem(sourceStageId, sourceLinkId, itemId);
    
    return copiedItem;
  }

  /**
   * 获取事项统计信息
   */
  getItemStatistics() {
    const allItems = this.getAllItems();
    
    const stats = {
      total: allItems.length,
      byStatus: {
        [ItemStatus.TODO]: 0,
        [ItemStatus.IN_PROGRESS]: 0,
        [ItemStatus.DONE]: 0
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0
      }
    };

    allItems.forEach(item => {
      stats.byStatus[item.status]++;
      stats.byPriority[item.priority]++;
    });

    return stats;
  }

  /**
   * 验证事项数据
   */
  validateItem(itemData) {
    const errors = [];

    if (!itemData.description || itemData.description.trim() === '') {
      errors.push('事项描述不能为空');
    }

    if (!Array.isArray(itemData.participants)) {
      errors.push('参与者必须是数组格式');
    }

    if (itemData.status && !Object.values(ItemStatus).includes(itemData.status)) {
      errors.push('无效的事项状态');
    }

    if (itemData.priority && !['low', 'medium', 'high'].includes(itemData.priority)) {
      errors.push('无效的优先级');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// 创建单例实例
export const itemService = new ItemService();
