export enum AppView {
  ALTAR = 'ALTAR',
  WORD = 'WORD',
  ACADEMY = 'ACADEMY',
}

export interface BibleVerse {
  verse: number;
  text: string;
}

export interface BibleChapter {
  book: string;
  chapter: number;
  version: string;
  verses: BibleVerse[];
}

export interface ExegesisResult {
  context: string;
  theology: string;
  application: string;
}

export interface Devotional {
  date: string;
  verse: string;
  reference: string;
  reflection: string; // HTML or Markdown string
  questions: string[];
}

export interface StudyPlan {
  topic: string;
  introduction: string;
  references: {
    reference: string;
    description: string;
  }[];
  conclusion: string;
}

export interface PrayerRequest {
  id: string;
  text: string;
  date: string;
  answered: boolean;
}

export interface GratitudeEntry {
  id: string;
  date: string;
  items: string[];
}

export interface Quote {
  text: string;
  author: string;
}

export type MusicMood = 'worship' | 'instrumental' | 'peace';