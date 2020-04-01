
import fs from 'fs'
import path from 'path'

export async function loadTemplate (templateName: string): Promise<string> {
  const templatePath = path.resolve(__dirname, '..', '..', '..', '..', 'pug', `${templateName}.pug`)
  const content = fs.readFileSync(templatePath)
  return content.toString('utf8')
}