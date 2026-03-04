// ============================================================================
// 每日挑战与学习日历系统类型定义
// 基于艾宾浩斯遗忘曲线的持续学习激励体系
// ============================================================================

import { Question, Difficulty } from './index';

/**
 * 每日挑战接口
 * 代表用户某一天的挑战任务（10 道题）
 */
export interface DailyChallenge {
  /** 日期（YYYY-MM-DD 格式，UTC） */
  date: string;

  /** 当日题目（10 道） */
  questions: Question[];

  /** 是否已完成 */
  completed: boolean;

  /** 得分（0-100） */
  score: number;

  /** 准确率（0-1） */
  accuracy: number;

  /** 总用时（秒） */
  timeSpent: number;

  /** 完成时间（ISO 8601） */
  completedAt?: string;

  /** 连击次数（用于连续完成挑战） */
  streakAtCompletion?: number;
}

/**
 * 每日记录接口
 * 用户每一天的学习记录摘要
 */
export interface DayRecord {
  /** 日期（YYYY-MM-DD 格式） */
  date: string;

  /** 是否完成当日练习（至少做了一题） */
  completed: boolean;

  /** 每日挑战是否完成 */
  dailyChallengeCompleted: boolean;

  /** 练习题目数量 */
  practiceCount: number;

  /** 准确率（0-1，可选） */
  accuracy?: number;

  /** 总用时（秒） */
  timeSpent?: number;

  /** 获得的星星数（0-3） */
  stars?: number;
}

/**
 * 勋章类型
 */
export type MedalType =
  | 'bronze_7'      // 铜牌：连续 7 天
  | 'silver_14'     // 银牌：连续 14 天
  | 'gold_21'       // 金牌：连续 21 天
  | 'platinum_30'   // 铂金牌：连续 30 天
  | 'diamond_100'   // 钻石牌：连续 100 天
  | 'perfect_week'  // 完美周：一周全勤
  | 'perfect_month' // 完美月：一月全勤
  | 'early_bird'    // 早鸟：连续 7 天在早上 8 点前学习
  | 'night_owl'     // 夜猫子：连续 7 天在晚上 9 点后学习
  | 'speed_demon'   // 速度达人：连续 5 天平均用时<10 秒
  | 'accuracy_master' // 准确率大师：连续 7 天准确率>90%
  ;

/**
 * 勋章元数据
 */
export interface Medal {
  /** 勋章类型 */
  type: MedalType;

  /** 勋章名称 */
  name: string;

  /** 勋章描述 */
  description: string;

  /** 勋章图标 */
  icon: string;

  /** 获得日期 */
  earnedAt: string;

  /** 关联的连续天数 */
  streakDays?: number;
}

/**
 * 学习日历接口
 * 用户的学习日历总览
 */
export interface StudyCalendar {
  /** 用户 ID */
  userId: number;

  /** 当前连续天数 */
  currentStreak: number;

  /** 最长连续天数 */
  longestStreak: number;

  /** 总学习天数 */
  totalStudyDays: number;

  /** 日历记录（日期 -> 每日记录） */
  calendar: Record<string, DayRecord>;

  /** 获得的勋章列表 */
  medals: Medal[];

  /** 补签卡数量 */
  makeupCards: number;

  /** 创建时间 */
  createdAt: string;

  /** 最后更新时间 */
  updatedAt: string;
}

/**
 * 补签记录
 */
export interface MakeupRecord {
  /** 补签日期 */
  date: string;

  /** 补签时间 */
  usedAt: string;

  /** 消耗的补签卡数量 */
  cost: number;
}

/**
 * 每日挑战配置
 */
export interface DailyChallengeConfig {
  /** 每日题目数量（默认 10） */
  questionsPerDay: number;

  /** 难度分布 */
  difficultyDistribution: {
    easy: number;    // 简单题比例（0-1）
    medium: number;  // 中等题比例（0-1）
    hard: number;    // 困难题比例（0-1）
  };

  /** 运算类型分布 */
  operationTypeDistribution: {
    addition: number;       // 加法比例
    subtraction: number;    // 减法比例
    multiplication: number; // 乘法比例
    division: number;       // 除法比例
  };

  /** 是否允许补签 */
  allowMakeup: boolean;

  /** 补签成本（每道补签卡可补几天） */
  makeupCost: number;
}

/**
 * 学习统计
 */
export interface StudyStats {
  /** 本周学习天数 */
  studyDaysThisWeek: number;

  /** 本周练习题目数 */
  questionsThisWeek: number;

  /** 本周平均准确率 */
  averageAccuracyThisWeek: number;

  /** 本周总用时（分钟） */
  totalTimeThisWeek: number;

  /** 上周学习天数（用于对比） */
  studyDaysLastWeek: number;

  /** 趋势（true=进步，false=退步） */
  trendingUp: boolean;
}

/**
 * 日历视图配置
 */
export interface CalendarViewConfig {
  /** 当前显示的月份（YYYY-MM） */
  currentMonth: string;

  /** 是否显示统计数据 */
  showStats: boolean;

  /** 是否显示勋章 */
  showMedals: boolean;

  /** 是否高亮连续天数 */
  highlightStreak: boolean;
}

/**
 * 每日挑战生成器接口
 */
export interface DailyChallengeGenerator {
  /**
   * 生成指定日期的挑战
   * @param date 日期（YYYY-MM-DD）
   * @param difficulty 难度
   * @param grade 年级（1-2）
   */
  generate(date: string, difficulty: Difficulty, grade: number): DailyChallenge;

  /**
   * 验证挑战是否有效
   * @param challenge 挑战
   */
  validate(challenge: DailyChallenge): boolean;
}

/**
 * 连续天数计算器
 * 负责计算连续天数、判定勋章等
 */
export class StreakManager {
  /**
   * 计算当前连续天数
   * @param calendar 学习日历
   * @param today 今天日期（YYYY-MM-DD，默认今天）
   */
  calculateCurrentStreak(calendar: StudyCalendar, today?: string): number {
    const checkDate = today || this.getTodayUTC();
    const { calendar: records } = calendar;

    let streak = 0;
    let currentDate = checkDate;

    // 从今天开始向前追溯
    while (true) {
      const record = records[currentDate];
      if (!record || !record.completed) {
        // 如果今天还没完成，检查是否到了新的一天
        if (currentDate === checkDate) {
          // 今天还没学习，继续检查昨天
          currentDate = this.getPreviousDay(currentDate);
          continue;
        }
        break;
      }

      streak++;
      currentDate = this.getPreviousDay(currentDate);
    }

    return streak;
  }

  /**
   * 检查是否应该授予勋章
   * @param streak 当前连续天数
   * @param existingMedals 已有勋章
   */
  shouldAwardMedal(streak: number, existingMedals: Medal[]): Medal | null {
    const medalDefinitions: Array<{ type: MedalType; days: number; name: string; icon: string }> = [
      { type: 'bronze_7', days: 7, name: '青铜战士', icon: '🥉' },
      { type: 'silver_14', days: 14, name: '白银战士', icon: '🥈' },
      { type: 'gold_21', days: 21, name: '黄金战士', icon: '🥇' },
      { type: 'platinum_30', days: 30, name: '铂金大师', icon: '💎' },
      { type: 'diamond_100', days: 100, name: '钻石传奇', icon: '👑' },
    ];

    // 检查是否达到新的勋章条件
    for (const def of medalDefinitions) {
      if (streak >= def.days) {
        const alreadyHas = existingMedals.some(m => m.type === def.type);
        if (!alreadyHas && streak === def.days) {
          return {
            type: def.type,
            name: def.name,
            description: `连续学习 ${def.days} 天`,
            icon: def.icon,
            earnedAt: new Date().toISOString(),
            streakDays: def.days,
          };
        }
      }
    }

    return null;
  }

  /**
   * 检查某一天是否可以补签
   * @param date 日期（YYYY-MM-DD）
   * @param calendar 学习日历
   * @param makeupCards 补签卡数量
   */
  canMakeUp(date: string, calendar: StudyCalendar, makeupCards: number): boolean {
    // 只能补签过去的日期
    if (date > this.getTodayUTC()) {
      return false;
    }

    // 不能补签已经完成的日期
    const record = calendar.calendar[date];
    if (record && record.completed) {
      return false;
    }

    // 必须有足够的补签卡
    return makeupCards > 0;
  }

  /**
   * 计算补签成本
   * @param daysMissed 连续错过的天数
   */
  calculateMakeupCost(daysMissed: number): number {
    // 补签成本：每错过 1 天需要 1 张补签卡
    // 连续错过超过 3 天，成本翻倍（鼓励持续学习）
    if (daysMissed <= 3) {
      return daysMissed;
    }
    return daysMissed * 2;
  }

  /**
   * 获取今天的 UTC 日期（YYYY-MM-DD 格式）
   */
  private getTodayUTC(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * 获取前一天的日期（YYYY-MM-DD 格式）
   * @param date 当前日期
   */
  private getPreviousDay(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    const prevDay = new Date(year, month - 1, day - 1);
    return prevDay.toISOString().split('T')[0];
  }

  /**
   * 检查是否是闰年
   * @param year 年份
   */
  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * 获取某月的天数
   * @param year 年份
   * @param month 月份（1-12）
   */
  getDaysInMonth(year: number, month: number): number {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && this.isLeapYear(year)) {
      return 29;
    }
    return daysInMonth[month - 1];
  }
}

/**
 * 每日挑战管理器
 */
export class DailyChallengeManager {
  private config: DailyChallengeConfig;

  constructor(config?: Partial<DailyChallengeConfig>) {
    this.config = {
      questionsPerDay: 10,
      difficultyDistribution: { easy: 0.3, medium: 0.5, hard: 0.2 },
      operationTypeDistribution: {
        addition: 0.4,
        subtraction: 0.4,
        multiplication: 0.1,
        division: 0.1,
      },
      allowMakeup: true,
      makeupCost: 1,
      ...config,
    };
  }

  /**
   * 创建新的每日挑战
   */
  createChallenge(
    date: string,
    questions: Question[]
  ): DailyChallenge {
    return {
      date,
      questions,
      completed: false,
      score: 0,
      accuracy: 0,
      timeSpent: 0,
    };
  }

  /**
   * 完成挑战
   */
  completeChallenge(
    challenge: DailyChallenge,
    correctCount: number,
    timeSpent: number
  ): DailyChallenge {
    const totalQuestions = challenge.questions.length;
    return {
      ...challenge,
      completed: true,
      score: Math.round((correctCount / totalQuestions) * 100),
      accuracy: correctCount / totalQuestions,
      timeSpent,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * 验证挑战完整性
   */
  validateChallenge(challenge: DailyChallenge): boolean {
    // 检查题目数量
    if (challenge.questions.length !== this.config.questionsPerDay) {
      return false;
    }

    // 检查题目有效性
    for (const question of challenge.questions) {
      if (!question.id || !question.expression || typeof question.answer !== 'number') {
        return false;
      }
    }

    return true;
  }
}

// ============================================================================
// LocalStorage 键名常量（添加到现有 STORAGE_KEYS）
// ============================================================================
export const DAILY_CHALLENGE_STORAGE_KEYS = {
  /** 学习日历数据 */
  STUDY_CALENDAR: 'childMath_studyCalendar',
  /** 每日挑战缓存 */
  DAILY_CHALLENGE: 'childMath_dailyChallenge',
  /** 补签记录 */
  MAKEUP_RECORDS: 'childMath_makeupRecords',
  /** 勋章陈列室 */
  MEDAL_CASE: 'childMath_medalCase',
} as const;

/**
 * 跨时区日期处理工具
 * 确保日期在不同时区下的一致性
 */
export const DateUtils = {
  /**
   * 获取 UTC 日期字符串（YYYY-MM-DD）
   */
  toUTCDateString(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
  },

  /**
   * 解析日期字符串为 Date 对象（UTC 午夜）
   */
  parseUTCDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  },

  /**
   * 判断两个日期是否是同一天（考虑时区）
   */
  isSameDay(date1: string, date2: string): boolean {
    return date1 === date2;
  },

  /**
   * 获取两个日期之间的天数差
   */
  getDaysDiff(date1: string, date2: string): number {
    const d1 = this.parseUTCDate(date1).getTime();
    const d2 = this.parseUTCDate(date2).getTime();
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
  },

  /**
   * 格式化日期为中文显示
   */
  formatChineseDate(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    return `${year}年${month}月${day}日`;
  },

  /**
   * 获取星期几（中文）
   */
  getWeekdayChinese(dateString: string): string {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const date = this.parseUTCDate(dateString);
    return weekdays[date.getUTCDay()];
  },

  /**
   * 检查日期是否有效（考虑闰年、大小月）
   */
  isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
      return false;
    }

    const [year, month, day] = dateString.split('-').map(Number);

    // 检查月份范围
    if (month < 1 || month > 12) {
      return false;
    }

    // 检查日期范围
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const maxDay = month === 2 && DateUtils.isLeapYear(year) ? 29 : daysInMonth[month - 1];

    return day >= 1 && day <= maxDay;
  },

  /**
   * 检查是否是闰年
   */
  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  },
};
