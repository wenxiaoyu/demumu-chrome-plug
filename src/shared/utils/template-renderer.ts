/**
 * 模板渲染引擎
 * 
 * 负责将模板变量替换为实际值
 */

import { EmailTemplate, EmailTemplateVariables } from '../types';

/**
 * HTML 转义函数
 * 防止 XSS 攻击
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 渲染模板
 * 将模板中的变量替换为实际值
 * 
 * @param template 邮件模板
 * @param variables 模板变量
 * @param escapeHtmlContent 是否对 HTML 内容进行转义（默认 true）
 * @returns 渲染后的邮件模板
 */
export function renderTemplate(
  template: EmailTemplate,
  variables: EmailTemplateVariables,
  escapeHtmlContent: boolean = true
): EmailTemplate {
  // 准备变量映射
  const varMap: Record<string, string> = {
    userName: escapeHtmlContent ? escapeHtml(variables.userName) : variables.userName,
    inactiveDays: variables.inactiveDays.toString(),
    lastActiveDate: variables.lastActiveDate,
    currentDate: variables.currentDate,
    merit: variables.merit.toString(),
    hp: variables.hp.toString(),
  };

  // 替换函数
  const replace = (text: string): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return varMap[key] !== undefined ? varMap[key] : match;
    });
  };

  // 渲染所有字段
  return {
    subject: replace(template.subject),
    htmlBody: replace(template.htmlBody),
    textBody: replace(template.textBody),
  };
}

/**
 * 验证模板变量是否完整
 * 
 * @param template 邮件模板
 * @returns 缺失的变量列表
 */
export function validateTemplate(template: EmailTemplate): string[] {
  const requiredVars = ['userName', 'inactiveDays', 'lastActiveDate', 'currentDate', 'merit', 'hp'];
  const missingVars: string[] = [];

  const allText = template.subject + template.htmlBody + template.textBody;

  for (const varName of requiredVars) {
    const pattern = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
    if (!pattern.test(allText)) {
      missingVars.push(varName);
    }
  }

  return missingVars;
}

/**
 * 提取模板中使用的所有变量
 * 
 * @param template 邮件模板
 * @returns 变量名称列表
 */
export function extractVariables(template: EmailTemplate): string[] {
  const allText = template.subject + template.htmlBody + template.textBody;
  const matches = allText.matchAll(/\{\{(\w+)\}\}/g);
  const variables = new Set<string>();

  for (const match of matches) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}
