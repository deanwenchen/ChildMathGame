export class AnswerValidator {
  private static instance: AnswerValidator;

  private constructor() {}

  public static getInstance(): AnswerValidator {
    if (!AnswerValidator.instance) {
      AnswerValidator.instance = new AnswerValidator();
    }
    return AnswerValidator.instance;
  }

  validateAnswer(
    userAnswer: number | string,
    correctAnswer: number,
    tolerance: number = 0
  ): boolean {
    // 转换为数字
    const userNum = typeof userAnswer === 'string'
      ? parseFloat(userAnswer)
      : userAnswer;

    // 检查是否为有效数字
    if (isNaN(userNum)) {
      return false;
    }

    // 对于整数运算，严格相等
    if (Number.isInteger(correctAnswer)) {
      return userNum === correctAnswer;
    }

    // 对于可能的小数（如除法），允许一定容差
    return Math.abs(userNum - correctAnswer) <= tolerance;
  }

  getFeedback(
    isCorrect: boolean,
    userAnswer: number,
    correctAnswer: number
  ): { message: string; type: 'success' | 'error' } {
    if (isCorrect) {
      const successMessages = [
        '太棒了！答对了！🎉',
        '真厉害！继续加油！👍',
        '答对啦！你真聪明！🌟',
        '完美！就是这样！💯',
        '太好了！完全正确！👏'
      ];
      return {
        message: successMessages[Math.floor(Math.random() * successMessages.length)],
        type: 'success'
      };
    } else {
      return {
        message: `再想想哦～正确答案是 ${correctAnswer}`,
        type: 'error'
      };
    }
  }
}

export default AnswerValidator.getInstance();
