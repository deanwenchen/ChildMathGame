import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  ClearAll as ClearIcon,
  Today as DateIcon,
} from '@mui/icons-material';
import { MistakeFiltersState, OperationType, Difficulty, ErrorType } from '../../types';

interface MistakeFiltersProps {
  filters: MistakeFiltersState;
  onFilterChange: (filters: MistakeFiltersState) => void;
  mistakeSummary?: {
    byOperationType: Record<OperationType, number>;
    byDifficulty: Record<Difficulty, number>;
    byErrorType: Record<ErrorType, number>;
  };
}

export const MistakeFilters: React.FC<MistakeFiltersProps> = ({
  filters,
  onFilterChange,
  mistakeSummary,
}) => {
  const handleOperationChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      operationType: value ? (value as OperationType) : undefined,
    });
  };

  const handleDifficultyChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      difficulty: value ? (value as Difficulty) : undefined,
    });
  };

  const handleErrorTypeChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      errorType: value ? (value as ErrorType) : undefined,
    });
  };

  const handleReviewedChange = (mastered: boolean | undefined) => {
    onFilterChange({
      ...filters,
      reviewed: mastered,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({});
  };

  // 运算类型选项
  const operationOptions = [
    { value: 'addition', label: '加法', count: mistakeSummary?.byOperationType.addition || 0 },
    { value: 'subtraction', label: '减法', count: mistakeSummary?.byOperationType.subtraction || 0 },
    { value: 'multiplication', label: '乘法', count: mistakeSummary?.byOperationType.multiplication || 0 },
    { value: 'division', label: '除法', count: mistakeSummary?.byOperationType.division || 0 },
  ];

  // 难度选项
  const difficultyOptions = [
    { value: 'easy', label: '简单', count: mistakeSummary?.byDifficulty.easy || 0 },
    { value: 'medium', label: '中等', count: mistakeSummary?.byDifficulty.medium || 0 },
    { value: 'hard', label: '困难', count: mistakeSummary?.byDifficulty.hard || 0 },
  ];

  // 错误类型选项
  const errorTypeOptions = [
    { value: 'decomposition_error', label: '分解错误', count: mistakeSummary?.byErrorType.decomposition_error || 0 },
    { value: 'calculation_error', label: '计算错误', count: mistakeSummary?.byErrorType.calculation_error || 0 },
    { value: 'step_missing', label: '步骤遗漏', count: mistakeSummary?.byErrorType.step_missing || 0 },
    { value: 'timeout', label: '超时', count: mistakeSummary?.byErrorType.timeout || 0 },
    { value: 'unknown', label: '未知错误', count: mistakeSummary?.byErrorType.unknown || 0 },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      {/* 筛选器标题 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            筛选错题
          </Typography>
        </Box>
        <Tooltip title="清除所有筛选">
          <IconButton onClick={handleClearFilters} size="small">
            <ClearIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 筛选条件 */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        {/* 运算类型筛选 */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>运算类型</InputLabel>
          <Select
            value={filters.operationType || ''}
            label="运算类型"
            onChange={handleOperationChange}
            sx={{ '& .MuiSelect-select': { fontSize: '0.9rem' } }}
          >
            <MenuItem value="">
              <em>全部</em>
            </MenuItem>
            {operationOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label} ({option.count})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 难度筛选 */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>难度</InputLabel>
          <Select
            value={filters.difficulty || ''}
            label="难度"
            onChange={handleDifficultyChange}
            sx={{ '& .MuiSelect-select': { fontSize: '0.9rem' } }}
          >
            <MenuItem value="">
              <em>全部</em>
            </MenuItem>
            {difficultyOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label} ({option.count})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 错误类型筛选 */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>错误类型</InputLabel>
          <Select
            value={filters.errorType || ''}
            label="错误类型"
            onChange={handleErrorTypeChange}
            sx={{ '& .MuiSelect-select': { fontSize: '0.9rem' } }}
          >
            <MenuItem value="">
              <em>全部</em>
            </MenuItem>
            {errorTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label} ({option.count})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 掌握状态筛选 */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <DateIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          掌握状态：
        </Typography>
        <Chip
          label="全部"
          size="small"
          onClick={() => handleReviewedChange(undefined)}
          color={filters.reviewed === undefined ? 'primary' : 'default'}
          variant={filters.reviewed === undefined ? 'filled' : 'outlined'}
          sx={{ cursor: 'pointer' }}
        />
        <Chip
          label="未掌握"
          size="small"
          onClick={() => handleReviewedChange(false)}
          color={filters.reviewed === false ? 'warning' : 'default'}
          variant={filters.reviewed === false ? 'filled' : 'outlined'}
          sx={{ cursor: 'pointer' }}
        />
        <Chip
          label="已掌握"
          size="small"
          onClick={() => handleReviewedChange(true)}
          color={filters.reviewed === true ? 'success' : 'default'}
          variant={filters.reviewed === true ? 'filled' : 'outlined'}
          sx={{ cursor: 'pointer' }}
        />
      </Box>
    </Box>
  );
};
