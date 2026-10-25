import { Component, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [FormsModule, ReactiveFormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  readonly fb = new FormBuilder();

  keywordForm = this.fb.group({
    keyword: ['', [Validators.required, Validators.minLength(2)]],
  });

  searchedKeyword = signal<string | null>(null);
  isLoading = signal(false);
  slogan = signal<string | null>(null);
  error = signal<string | null>(null);

  get keyword() {
    return this.keywordForm.controls.keyword;
  }

  async search() {
    this.keywordForm.markAllAsTouched();
    if (this.keywordForm.invalid) {
      return;
    }

    const keyword = this.keyword.value?.trim() ?? '';
    this.searchedKeyword.set(keyword);
    this.slogan.set(null);
    this.error.set(null);
    this.isLoading.set(true);

    try {
      const url = `generate-slogan?text=${encodeURIComponent(keyword)}`;
      const response = await fetch(url);
      const data: { slogan?: string; error?: string; details?: string } =
        await response.json();

      if (!response.ok || !data.slogan) {
        this.slogan.set(null);
        this.error.set(
          data.error ?? `Request failed with status ${response.status}`
        );
        return;
      }
      this.slogan.set(data.slogan);
    } catch (err) {
      this.slogan.set(null);
      this.error.set(
        err instanceof Error
          ? `Could not reach the slogan service: ${err.message}`
          : 'Could not reach the slogan service.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
