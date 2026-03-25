/**
 * RewardCalculator 单元测试
 *
 * 测试覆盖：
 * - 签到奖励计算
 * - 每日挑战奖励计算
 * - 补签逻辑
 */

import { RewardCalculator } from '../RewardCalculator';
import { MedalSystem } from '../MedalSystem';

describe('RewardCalculator', () => {
  let calculator: RewardCalculator;

  beforeEach(() => {
    calculator = new RewardCalculator();
  });

  describe('calculateCheckInReward', () => {
    it('应返回 1 天签到奖励（10 金币）', () => {
      const result = calculator.calculateCheckInReward(1);
      expect(result.coins).toBe(10);
      expect(result.medal).toBeUndefined();
    });

    it('应返回 3 天签到奖励（30 金币 + 初出茅庐勋章）', () => {
      const result = calculator.calculateCheckInReward(3);
      expect(result.coins).toBe(30);
      expect(result.medal).toBeDefined();
      expect(result.medal?.id).toBe('medal_beginner');
    });

    it('应返回 7 天签到奖励（70 金币 + 持之以恒勋章）', () => {
      const result = calculator.calculateCheckInReward(7);
      expect(result.coins).toBe(70);
      expect(result.medal?.id).toBe('medal_persistent');
    });

    it('应返回 14 天签到奖励（140 金币 + 坚持不懈勋章）', () => {
      const result = calculator.calculateCheckInReward(14);
      expect(result.coins).toBe(140);
      expect(result.medal?.id).toBe('medal_perseverance');
    });

    it('应返回 30 天签到奖励（300 金币 + 学习达人勋章）', () => {
      const result = calculator.calculateCheckInReward(30);
      expect(result.coins).toBe(300);
      expect(result.medal?.id).toBe('medal_learner');
    });

    it('应返回 100 天签到奖励（1000 金币 + 学霸之王勋章）', () => {
      const result = calculator.calculateCheckInReward(100);
      expect(result.coins).toBe(1000);
      expect(result.medal?.id).toBe('medal_champion');
    });

    it('应支持跨档位奖励（如连续 10 天应获得 7 天档位奖励）', () => {
      const result = calculator.calculateCheckInReward(10);
      expect(result.coins).toBe(70); // 7 天档位
      expect(result.medal?.id).toBe('medal_persistent');
    });
  });

  describe('calculateDailyChallengeReward', () => {
    it('应返回基础奖励（20 金币）', () => {
      const result = calculator.calculateDailyChallengeReward(0.5, 0);
      expect(result).toBe(20);
    });

    it('应返回完美奖励（20 + 30 = 50 金币）', () => {
      const result = calculator.calculateDailyChallengeReward(1.0, 0);
      expect(result).toBe(50);
    });

    it('应计算连击奖励（每连对 1 题 +2 金币）', () => {
      const result = calculator.calculateDailyChallengeReward(1.0, 10);
      expect(result).toBe(70); // 20 + 30 + 20
    });

    it('应限制连击奖励上限（40 金币）', () => {
      const result = calculator.calculateDailyChallengeReward(1.0, 30);
      expect(result).toBe(90); // 20 + 30 + 40 (上限)
    });

    it('应处理非完美但高连击的情况', () => {
      const result = calculator.calculateDailyChallengeReward(0.8, 15);
      expect(result).toBe(50); // 20 + 30 (无完美奖励)
    });
  });

  describe('calculateMakeupCost', () => {
    it('应计算 1 天补签成本（50 金币）', () => {
      const cost = calculator.calculateMakeupCost(1);
      expect(cost).toBe(50);
    });

    it('应计算 3 天补签成本（150 金币）', () => {
      const cost = calculator.calculateMakeupCost(3);
      expect(cost).toBe(150);
    });

    it('应限制最大补签天数为 7 天', () => {
      const cost = calculator.calculateMakeupCost(10);
      expect(cost).toBe(350); // 7 * 50
    });
  });

  describe('canMakeUp', () => {
    it('应允许补签 7 天内的缺席（金币充足）', () => {
      const result = calculator.canMakeUp('2026-03-01', 100, '2026-03-03');
      expect(result).toBe(true);
    });

    it('应拒绝补签超过 7 天的缺席', () => {
      const result = calculator.canMakeUp('2026-02-20', 100, '2026-03-03');
      expect(result).toBe(false);
    });

    it('应拒绝金币不足的补签', () => {
      const result = calculator.canMakeUp('2026-03-01', 30, '2026-03-03');
      expect(result).toBe(false); // 需要 50 金币，但只有 30
    });

    it('应拒绝补签未来日期', () => {
      const result = calculator.canMakeUp('2026-03-05', 100, '2026-03-03');
      expect(result).toBe(false);
    });
  });

  describe('getMakeupRange', () => {
    it('应返回过去 7 天的日期列表', () => {
      const range = calculator.getMakeupRange('2026-03-03');
      expect(range).toHaveLength(7);
      expect(range[0]).toBe('2026-03-02');
      expect(range[6]).toBe('2026-02-24');
    });
  });
});

describe('MedalSystem', () => {
  let medalSystem: MedalSystem;

  beforeEach(() => {
    medalSystem = new MedalSystem();
  });

  describe('checkEligibility', () => {
    it('应返回符合条件的勋章（3 天连续）', () => {
      const eligible = medalSystem.checkEligibility(3, []);
      expect(eligible).toHaveLength(1);
      expect(eligible[0].id).toBe('medal_beginner');
    });

    it('应返回多个符合条件的勋章（7 天连续，未获得任何勋章）', () => {
      const eligible = medalSystem.checkEligibility(7, []);
      expect(eligible).toHaveLength(2);
      expect(eligible.map(m => m.id)).toContain('medal_beginner');
      expect(eligible.map(m => m.id)).toContain('medal_persistent');
    });

    it('应过滤已获得的勋章', () => {
      const eligible = medalSystem.checkEligibility(7, ['medal_beginner']);
      expect(eligible).toHaveLength(1);
      expect(eligible[0].id).toBe('medal_persistent');
    });

    it('应返回空数组（无符合条件勋章）', () => {
      const eligible = medalSystem.checkEligibility(2, []);
      expect(eligible).toHaveLength(0);
    });

    it('应返回空数组（已获得所有勋章）', () => {
      const allMedalIds = medalSystem.getAllMedals().map(m => m.id);
      const eligible = medalSystem.checkEligibility(100, allMedalIds);
      expect(eligible).toHaveLength(0);
    });
  });

  describe('getMedalById', () => {
    it('应返回存在的勋章', () => {
      const medal = medalSystem.getMedalById('medal_beginner');
      expect(medal).toBeDefined();
      expect(medal?.name).toBe('初出茅庐');
    });

    it('应返回 null（不存在的 ID）', () => {
      const medal = medalSystem.getMedalById('invalid_id');
      expect(medal).toBeNull();
    });
  });

  describe('getAllMedals', () => {
    it('应返回所有勋章定义', () => {
      const medals = medalSystem.getAllMedals();
      expect(medals).toHaveLength(5);
    });

    it('应包含获得状态（当提供 userMedals 时）', () => {
      const medals = medalSystem.getAllMedals(true, ['medal_beginner']);
      const beginner = medals.find(m => m.id === 'medal_beginner');
      const persistent = medals.find(m => m.id === 'medal_persistent');
      expect(beginner?.earned).toBe(true);
      expect(persistent?.earned).toBe(false);
    });
  });

  describe('getMedalsByRarity', () => {
    it('应按稀有度排序（从低到高）', () => {
      const sorted = medalSystem.getMedalsByRarity();
      expect(sorted[0].rarity).toBe('common');
      expect(sorted[4].rarity).toBe('legendary');
    });
  });

  describe('getNextMedal', () => {
    it('应返回下一个可获得的勋章', () => {
      const next = medalSystem.getNextMedal(5, ['medal_beginner']);
      expect(next).toBeDefined();
      expect(next?.id).toBe('medal_persistent');
      expect(next?.progress).toBe(5);
      expect(next?.required).toBe(7);
    });

    it('应返回 null（已获得所有勋章）', () => {
      const allMedalIds = medalSystem.getAllMedals().map(m => m.id);
      const next = medalSystem.getNextMedal(100, allMedalIds);
      expect(next).toBeNull();
    });
  });
});
