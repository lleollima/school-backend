import { IsNotEmpty, IsMongoId } from 'class-validator';

export class AssignStudentDto {
  @IsNotEmpty()
  @IsMongoId()
  studentId: string;
}

