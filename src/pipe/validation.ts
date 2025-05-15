import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Value } from '@sinclair/typebox/value';
import { TSchema } from '@sinclair/typebox';

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private schema: TSchema) {}

  transform(value: any) {
    const result = Value.Check(this.schema, value);
    if (!result) {
      const errors = [...Value.Errors(this.schema, value)]
        .map((err) => `${err.path || 'value'} ${err.message}`)
        .join(', ');
      throw new BadRequestException(`Validation failed: ${errors}`);
    }

    return value;
  }
}
