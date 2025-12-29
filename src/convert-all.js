#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();

program
  .name('svg-to-png-batch')
  .description('Batch convert SVG files to PNG format')
  .version('1.0.0')
  .option('-d, --directory <path>', 'Directory containing SVG files (default: current directory)', process.cwd())
  .option('-o, --output-dir <path>', 'Output directory for PNG files (default: same as input directory)')
  .option('-w, --width <number>', 'Output width in pixels (default: 1200)', '1200')
  .option('-h, --height <number>', 'Output height in pixels (default: 630)', '630')
  .option('-q, --quality <number>', 'PNG quality (1-100, default: 100)', '100')
  .option('-r, --recursive', 'Recursively convert SVG files in subdirectories')
  .option('--pattern <pattern>', 'File name pattern to match (e.g., "cover-*.svg")', '*.svg')
  .parse(process.argv);

const options = program.opts();

async function batchConvertSvgToPng() {
  const spinner = ora('Starting batch conversion...').start();

  try {
    // 解析目录路径
    let inputDir = options.directory;
    if (!path.isAbsolute(inputDir)) {
      inputDir = path.resolve(inputDir);
    }

    // 检查输入目录是否存在
    if (!fs.existsSync(inputDir)) {
      spinner.fail(chalk.red(`Error: Directory not found: ${inputDir}`));
      process.exit(1);
    }

    // 解析输出目录
    let outputDir = options.outputDir;
    if (!outputDir) {
      outputDir = inputDir;
    } else if (!path.isAbsolute(outputDir)) {
      outputDir = path.resolve(outputDir);
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

    // 查找所有 SVG 文件
    const svgFiles = findSvgFiles(inputDir, options.pattern, options.recursive);

    if (svgFiles.length === 0) {
      spinner.warn(chalk.yellow('No SVG files found'));
      console.log(chalk.gray(`\nSearched in: ${inputDir}`));
      console.log(chalk.gray(`Pattern: ${options.pattern}`));
      if (options.recursive) {
        console.log(chalk.gray('Recursive: Yes'));
      }
      process.exit(0);
    }

    spinner.text = `Found ${svgFiles.length} SVG file(s) to convert...`;
    spinner.stop();
    console.log(chalk.cyan(`\nFound ${svgFiles.length} SVG file(s):\n`));

    // 显示要转换的文件列表
    svgFiles.forEach((file, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${path.relative(inputDir, file)}`));
    });

    console.log(chalk.cyan(`\nConverting to ${width}x${height} PNG...\n`));

    // 批量转换
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    for (let i = 0; i < svgFiles.length; i++) {
      const inputPath = svgFiles[i];
      const relativePath = path.relative(inputDir, inputPath);
      const progressSpinner = ora(`[${i + 1}/${svgFiles.length}] Converting ${relativePath}...`).start();

      try {
        // 计算输出路径
        const relativeOutputPath = inputPath.replace(/\.svg$/i, '.png');
        let outputPath = relativeOutputPath;

        // 如果输出目录与输入目录不同，替换路径
        if (outputDir !== inputDir) {
          outputPath = path.join(outputDir, path.relative(inputDir, inputPath)).replace(/\.svg$/i, '.png');
        }

        // 读取 SVG 内容
        const svgBuffer = fs.readFileSync(inputPath);

        // 转换为 PNG
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
        const outDir = path.dirname(outputPath);
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }

        // 写入 PNG 文件
        fs.writeFileSync(outputPath, pngBuffer);

        // 获取文件大小
        const stats = fs.statSync(outputPath);
        const fileSize = (stats.size / 1024).toFixed(2);

        progressSpinner.succeed(chalk.green(`[${i + 1}/${svgFiles.length}] ✓ ${relativePath} → ${fileSize} KB`));
        results.success++;

      } catch (error) {
        progressSpinner.fail(chalk.red(`[${i + 1}/${svgFiles.length}] ✗ ${relativePath}`));
        results.failed++;
        results.errors.push({
          file: relativePath,
          error: error.message
        });
      }
    }

    // 显示汇总信息
    console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.bold('Conversion Summary:'));
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.green(`  ✓ Success: ${results.success}`));
    console.log(chalk.red(`  ✗ Failed:  ${results.failed}`));
    console.log(chalk.gray(`  Total:    ${svgFiles.length}`));

    if (results.errors.length > 0) {
      console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.red('Errors:'));
      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      results.errors.forEach(({ file, error }) => {
        console.log(chalk.red(`  • ${file}`));
        console.log(chalk.gray(`    ${error}`));
      });
    }

    console.log(chalk.gray(`\nOutput directory: ${outputDir}`));
    console.log(chalk.gray(`Output size: ${width}x${height}`));
    console.log(chalk.gray(`Quality: ${quality}%\n`));

  } catch (error) {
    spinner.fail(chalk.red('Batch conversion failed:'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

function findSvgFiles(dir, pattern, recursive) {
  const svgFiles = [];

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && recursive) {
      // 递归搜索子目录
      svgFiles.push(...findSvgFiles(fullPath, pattern, recursive));
    } else if (stat.isFile() && item.toLowerCase().endsWith('.svg')) {
      // 检查文件名是否匹配模式
      if (matchesPattern(item, pattern)) {
        svgFiles.push(fullPath);
      }
    }
  }

  return svgFiles.sort();
}

function matchesPattern(filename, pattern) {
  // 简单的通配符匹配
  const regex = new RegExp(
    '^' +
    pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.') +
    '$'
  );
  return regex.test(filename);
}

batchConvertSvgToPng();
