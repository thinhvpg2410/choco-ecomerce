import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AskDto {
  @IsString({ message: 'Câu hỏi phải là một chuỗi văn bản.' })
  @IsNotEmpty({ message: 'Nội dung câu hỏi không được để trống.' })
  @MaxLength(500, { message: 'Câu hỏi quá dài, vui lòng nhập dưới 500 ký tự.' })
  prompt: string;

  @IsString({ message: 'Session ID phải là một chuỗi văn bản.' })
  @IsOptional()
  sessionId?: string;
}

// Export ra để chat.controller.ts dùng được — fix lỗi TS4053
export interface AskResponse {
  message: string;
  suggestedProducts: {
    id: string;
    name: string;
    price: number;
    sale_price: number | null;
    image_url: string | null;
  }[];
}
