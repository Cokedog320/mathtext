import { generateProblems } from './src/utils/problemGenerator';
console.log("1-10 + only (addition):", generateProblems('1-10', 'horizontal-add', 'only'));
console.log("1-10 + only (subtraction):", generateProblems('1-10', 'horizontal-sub', 'only'));
