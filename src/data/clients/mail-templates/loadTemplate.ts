
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)

export async function loadTemplate (templateName: string): Promise<string> {
  const templatePath = path.resolve(__dirname, '..', '..', '..', '..', 'pug', `${templateName}.pug`)

  return readFile(templatePath).then(content => content.toString('utf8'))
}