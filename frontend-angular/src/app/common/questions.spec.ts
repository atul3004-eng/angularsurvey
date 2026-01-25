import { Questions } from './questions';

describe('Questions', () => {
  it('should create an instance', () => {
    expect(new Questions(1, 'Test Question')).toBeTruthy();
  });
});
