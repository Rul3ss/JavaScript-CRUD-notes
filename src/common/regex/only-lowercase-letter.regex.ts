import { RegexProtocol } from './regex.protocol';

export class OnlyLowerCaseLetter implements RegexProtocol {
  execute(str: string): string {
    return str.replace(/[^a-z]/g, '');
  }
}
