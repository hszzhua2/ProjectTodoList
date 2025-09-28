/**
 * JSON工具类
 * 用于处理JSON数据的导入导出
 */
export class JsonHelper {
  /**
   * 解析JSON字符串
   */
  static parse(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`JSON解析失败: ${error.message}`);
    }
  }

  /**
   * 将对象转换为JSON字符串
   */
  static stringify(obj, pretty = true) {
    try {
      return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
    } catch (error) {
      throw new Error(`JSON序列化失败: ${error.message}`);
    }
  }

  /**
   * 验证JSON格式
   */
  static isValidJSON(jsonString) {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 从文件读取JSON数据
   */
  static async readFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('没有选择文件'));
        return;
      }

      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        reject(new Error('请选择JSON格式的文件'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonData = this.parse(event.target.result);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * 下载JSON数据为文件
   */
  static downloadAsFile(data, filename = 'project-data.json') {
    try {
      const jsonString = this.stringify(data);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL对象
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      throw new Error(`文件下载失败: ${error.message}`);
    }
  }

  /**
   * 验证项目数据结构
   */
  static validateProjectData(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
      errors.push('数据必须是对象格式');
      return { isValid: false, errors };
    }

    // 检查必需的字段
    if (!data.stages || !Array.isArray(data.stages)) {
      errors.push('缺少stages字段或格式不正确');
    }

    // 验证阶段数据
    if (data.stages) {
      data.stages.forEach((stage, stageIndex) => {
        if (!stage.id) {
          errors.push(`阶段 ${stageIndex + 1} 缺少id字段`);
        }
        if (!stage.name) {
          errors.push(`阶段 ${stageIndex + 1} 缺少name字段`);
        }
        if (!stage.links || !Array.isArray(stage.links)) {
          errors.push(`阶段 ${stageIndex + 1} 缺少links字段或格式不正确`);
        } else {
          // 验证链路数据
          stage.links.forEach((link, linkIndex) => {
            if (!link.id) {
              errors.push(`阶段 ${stageIndex + 1} 链路 ${linkIndex + 1} 缺少id字段`);
            }
            if (!link.name) {
              errors.push(`阶段 ${stageIndex + 1} 链路 ${linkIndex + 1} 缺少name字段`);
            }
            if (!link.items || !Array.isArray(link.items)) {
              errors.push(`阶段 ${stageIndex + 1} 链路 ${linkIndex + 1} 缺少items字段或格式不正确`);
            } else {
              // 验证事项数据
              link.items.forEach((item, itemIndex) => {
                if (!item.id) {
                  errors.push(`阶段 ${stageIndex + 1} 链路 ${linkIndex + 1} 事项 ${itemIndex + 1} 缺少id字段`);
                }
                if (!item.description) {
                  errors.push(`阶段 ${stageIndex + 1} 链路 ${linkIndex + 1} 事项 ${itemIndex + 1} 缺少description字段`);
                }
              });
            }
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 深度克隆对象
   */
  static deepClone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      throw new Error(`对象克隆失败: ${error.message}`);
    }
  }

  /**
   * 合并两个项目数据
   */
  static mergeProjectData(baseData, newData) {
    try {
      const merged = this.deepClone(baseData);
      
      if (newData.stages && Array.isArray(newData.stages)) {
        newData.stages.forEach(newStage => {
          const existingStageIndex = merged.stages.findIndex(stage => stage.name === newStage.name);
          
          if (existingStageIndex !== -1) {
            // 合并现有阶段
            const existingStage = merged.stages[existingStageIndex];
            if (newStage.links && Array.isArray(newStage.links)) {
              newStage.links.forEach(newLink => {
                const existingLinkIndex = existingStage.links.findIndex(link => link.name === newLink.name);
                
                if (existingLinkIndex !== -1) {
                  // 合并现有链路的事项
                  if (newLink.items && Array.isArray(newLink.items)) {
                    existingStage.links[existingLinkIndex].items.push(...newLink.items);
                  }
                } else {
                  // 添加新链路
                  existingStage.links.push(newLink);
                }
              });
            }
          } else {
            // 添加新阶段
            merged.stages.push(newStage);
          }
        });
      }
      
      return merged;
    } catch (error) {
      throw new Error(`数据合并失败: ${error.message}`);
    }
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 生成文件名（带时间戳）
   */
  static generateFileName(baseName = 'project-data', extension = 'json') {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${baseName}-${timestamp}.${extension}`;
  }

  /**
   * 压缩JSON数据（移除空白字符）
   */
  static compress(data) {
    return this.stringify(data, false);
  }

  /**
   * 美化JSON数据（添加缩进）
   */
  static prettify(jsonString) {
    const data = this.parse(jsonString);
    return this.stringify(data, true);
  }
}
