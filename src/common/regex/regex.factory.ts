import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OnlyLowerCaseLetter } from './only-lowercase-letter.regex';
import { RemoveSpacesRegex } from './remove-spaces.regex';
import { RegexProtocol } from './regex.protocol';
export type ClassNames = 'OnlyLowercaseLetterRegex' | 'RemoveSpacesRegex';

@Injectable()
export class RegexFactory {
  create(className: ClassNames): RegexProtocol {
    switch (className) {
      case 'OnlyLowercaseLetterRegex':
        return new OnlyLowerCaseLetter();
      case 'RemoveSpacesRegex':
        return new RemoveSpacesRegex();
      default:
        throw new InternalServerErrorException(
          `No class found for ${className}`,
        );
    }
  }
}
