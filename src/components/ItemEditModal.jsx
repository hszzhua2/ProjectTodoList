import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.jsx';
import { Calendar } from '@/components/ui/calendar.jsx';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.jsx';
import { cn } from '@/lib/utils.js';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  CalendarIcon, 
  X, 
  Plus, 
  Save, 
  Trash2,
  AlertCircle,
  Users,
  Clock,
  Flag
} from 'lucide-react';
import { Item, ItemStatus } from '../types/index.js';
import { itemService } from '../services/ItemService.js';

const ItemEditModal = ({ 
  isOpen, 
  onClose, 
  stageId, 
  linkId, 
  item, 
  onSave, 
  onDelete 
}) => {
  const [formData, setFormData] = useState({
    description: '',
    participants: [],
    status: ItemStatus.TODO,
    priority: 'medium',
    startDate: null,
    endDate: null,
    notes: ''
  });
  const [newParticipant, setNewParticipant] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 预定义的参与者选项
  const commonParticipants = [
    '规划', '建筑', '结构', '机电', '医疗工艺咨询',
    '设备供应商', '施工方', '监理方', '医院方',
    '代建方', '设计方', '政府部门', '第三方检测'
  ];

  useEffect(() => {
    if (isOpen) {
      if (item) {
        // 编辑模式
        setFormData({
          description: item.description || '',
          participants: [...(item.participants || [])],
          status: item.status || ItemStatus.TODO,
          priority: item.priority || 'medium',
          startDate: item.startDate ? new Date(item.startDate) : null,
          endDate: item.endDate ? new Date(item.endDate) : null,
          notes: item.notes || ''
        });
      } else {
        // 新建模式
        setFormData({
          description: '',
          participants: [],
          status: ItemStatus.TODO,
          priority: 'medium',
          startDate: null,
          endDate: null,
          notes: ''
        });
      }
      setErrors({});
      setNewParticipant('');
    }
  }, [isOpen, item]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除相关错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const addParticipant = (participant) => {
    const trimmed = participant.trim();
    if (trimmed && !formData.participants.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, trimmed]
      }));
    }
    setNewParticipant('');
  };

  const removeParticipant = (participant) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p !== participant)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = '事项描述不能为空';
    }

    if (formData.participants.length === 0) {
      newErrors.participants = '至少需要添加一个参与者';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '结束日期不能早于开始日期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const itemData = {
        ...formData,
        startDate: formData.startDate ? formData.startDate.toISOString().split('T')[0] : null,
        endDate: formData.endDate ? formData.endDate.toISOString().split('T')[0] : null
      };

      let savedItem;
      if (item) {
        // 更新现有事项
        savedItem = itemService.updateItem(stageId, linkId, {
          ...item,
          ...itemData
        });
      } else {
        // 创建新事项
        savedItem = itemService.addItem(stageId, linkId, itemData);
      }

      if (onSave) {
        onSave(savedItem);
      }
      
      onClose();
    } catch (error) {
      console.error('保存事项失败:', error);
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item || !confirm('确定要删除这个事项吗？')) {
      return;
    }

    setIsLoading(true);
    try {
      itemService.deleteItem(stageId, linkId, item.id);
      
      if (onDelete) {
        onDelete(item);
      }
      
      onClose();
    } catch (error) {
      console.error('删除事项失败:', error);
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case ItemStatus.TODO: return '待办';
      case ItemStatus.IN_PROGRESS: return '进行中';
      case ItemStatus.DONE: return '已完成';
      default: return '未知';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return '高优先级';
      case 'medium': return '中优先级';
      case 'low': return '低优先级';
      default: return '中优先级';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item ? '编辑事项' : '新建事项'}
            {item && (
              <Badge variant="outline" className="text-xs">
                ID: {item.id.slice(-8)}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {item ? '修改事项的详细信息' : '创建一个新的项目事项'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 错误提示 */}
          {errors.general && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{errors.general}</span>
            </div>
          )}

          {/* 事项描述 */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <span>事项描述</span>
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="请输入事项的详细描述..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={cn(errors.description && "border-red-500")}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* 参与者 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>参与专业及人员</span>
              <span className="text-red-500">*</span>
            </Label>
            
            {/* 已添加的参与者 */}
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-lg bg-gray-50">
              {formData.participants.map((participant, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {participant}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeParticipant(participant)}
                  />
                </Badge>
              ))}
              {formData.participants.length === 0 && (
                <span className="text-sm text-gray-500">暂无参与者</span>
              )}
            </div>

            {/* 添加参与者 */}
            <div className="flex gap-2">
              <Input
                placeholder="输入参与者名称..."
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addParticipant(newParticipant);
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addParticipant(newParticipant)}
                disabled={!newParticipant.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* 常用参与者快速选择 */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">常用参与者：</Label>
              <div className="flex flex-wrap gap-1">
                {commonParticipants.map((participant) => (
                  <Button
                    key={participant}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => addParticipant(participant)}
                    disabled={formData.participants.includes(participant)}
                  >
                    {participant}
                  </Button>
                ))}
              </div>
            </div>

            {errors.participants && (
              <p className="text-sm text-red-500">{errors.participants}</p>
            )}
          </div>

          {/* 状态和优先级 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                状态
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ItemStatus.TODO}>
                    {getStatusText(ItemStatus.TODO)}
                  </SelectItem>
                  <SelectItem value={ItemStatus.IN_PROGRESS}>
                    {getStatusText(ItemStatus.IN_PROGRESS)}
                  </SelectItem>
                  <SelectItem value={ItemStatus.DONE}>
                    {getStatusText(ItemStatus.DONE)}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                优先级
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">高优先级</SelectItem>
                  <SelectItem value="medium">中优先级</SelectItem>
                  <SelectItem value="low">低优先级</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 日期选择 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>开始日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "PPP", { locale: zhCN })
                    ) : (
                      "选择开始日期"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => handleInputChange('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>结束日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "PPP", { locale: zhCN })
                    ) : (
                      "选择结束日期"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => handleInputChange('endDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              placeholder="添加备注信息..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {item && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                删除
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemEditModal;
