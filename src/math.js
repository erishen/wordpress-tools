const Fraction = require('fraction.js');

function calculateAndAdjust(num1, num2) {
  const sum = new Fraction(num1).add(new Fraction(num2));
  if (sum.compare(3) > 0) {
    return sum.sub(new Fraction(3, 4));
  }
  return sum;
}

// 示例调用
const result = calculateAndAdjust(1 / 5, 1 / 3);
console.log(result.toFraction());
