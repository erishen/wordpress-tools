#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();

program
  .name('svg-to-png')
  .description('Convert SVG files to PNG format')
  .version('1.0.0')
  .requiredOption('-i, --input <file>', 'Input SVG file path')
  .option('-o, --output <file>', 'Output PNG file path (default: same name as input with .png extension)')
  .option('-w, --width <number>', 'Output width in pixels (default: 1200)', '1200')
  .option('-h, --height <number>', 'Output height in pixels (default: 630)', '630')
  .option('-q, --quality <number>', 'PNG quality (1-100, default: 100)', '100')
  .option('-d, --directory <path>', 'Working directory (default: current directory)', process.cwd())
  .parse(process.argv);

const options = program.opts();

async function convertSvgToPng() {
  const spinner = ora('Converting SVG to PNG...').start();

  try {
    // 解析输入路径
    let inputPath = options.input;
    if (!path.isAbsolute(inputPath)) {
      inputPath = path.join(options.directory, inputPath);
    }

    // 检查输入文件是否存在
    if (!fs.existsSync(inputPath)) {
      spinner.fail(chalk.red(`Error: Input file not found: ${inputPath}`));
      process.exit(1);
    }

    // 检查文件扩展名
    if (!inputPath.toLowerCase().endsWith('.svg')) {
      spinner.fail(chalk.red('Error: Input file must be an SVG file'));
      process.exit(1);
    }

    // 解析输出路径
    let outputPath = options.output;
    if (!outputPath) {
      outputPath = inputPath.replace(/\.svg$/i, '.png');
    } else if (!path.isAbsolute(outputPath)) {
      outputPath = path.join(options.directory, outputPath);
    }

    // 解析尺寸
    const width = parseInt(options.width, 10);
    const height = parseInt(options.height, 10);
    const quality = parseInt(options.quality, 10);

    if (isNaN(width) || width <= 0) {
      spinner.fail(chalk.red('Error: Invalid width'));
      process.exit(1);
    }
    if (isNaN(height) || height <= 0) {
      spinner.fail(chalk.red('Error: Invalid height'));
      process.exit(1);
    }
    if (isNaN(quality) || quality < 1 || quality > 100) {
      spinner.fail(chalk.red('Error: Quality must be between 1 and 100'));
      process.exit(1);
    }

    // 读取 SVG 内容
    const svgBuffer = fs.readFileSync(inputPath);

    // 转换为 PNG
    spinner.text = `Converting ${path.basename(inputPath)} to ${width}x${height} PNG...`;

    const pngBuffer = await sharp(svgBuffer)
      .resize(width, height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({
        quality: quality,
        compressionLevel: 9
      })
      .toBuffer();

    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 写入 PNG 文件
    fs.writeFileSync(outputPath, pngBuffer);

    // 获取文件大小
    const stats = fs.statSync(outputPath);
    const fileSize = (stats.size / 1024).toFixed(2);

    spinner.succeed(chalk.green(`Successfully converted to: ${outputPath}`));
    console.log(chalk.gray('\nDetails:'));
    console.log(chalk.gray(`  Size: ${width}x${height}`));
    console.log(chalk.gray(`  Quality: ${quality}%`));
    console.log(chalk.gray(`  File size: ${fileSize} KB`));
    console.log(chalk.gray(`  Path: ${path.resolve(outputPath)}`));

  } catch (error) {
    spinner.fail(chalk.red('Conversion failed:'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

convertSvgToPng();
