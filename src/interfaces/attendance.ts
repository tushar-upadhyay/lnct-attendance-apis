export interface attendance {
  'Total Lectures': number;
  Branch: string;
  College: string;
  DaysNeeded: number;
  LecturesNeeded: number;
  Name: string;
  Percentage: number;
  'Present ': number;
  Semester: string;
}

interface _subjectwise {
  Subject: string;
  TotalLectures: string;
  Present: string;
  Percentage: number;
}

interface _datewiseobject {
  [Key: string]: string;
}

interface _datewise {
  date: string;
  data: _datewiseobject[];
}

interface _tilldateattattendance {
  date: string;
  present: number;
  totalLectures: number;
  percentage: number;
}

export type subjectwise = _subjectwise[];

export type datewise = _datewise[];

export type tilldateattendance = _tilldateattattendance[];