import './style.css';
import { of, Observable, shareReplay } from 'rxjs';

class CacheService {
  private readonly cacheMap = new Map<string, Observable<any>>();
  private readonly CACHE_SIZE = 1;

  public cachify<T>(
    cacheKey: string,
    cacheValue$: Observable<T>
  ): Observable<T> {
    if (!this.cacheMap.has(cacheKey)) {
      this.cacheMap.set(
        cacheKey,
        cacheValue$.pipe(shareReplay(this.CACHE_SIZE))
      );
    }
    return this.cacheMap.get(cacheKey);
  }
}

const instance = new CacheService();

instance
  .cachify('asdfasdf', of('resolve basic string value :)'))
  .subscribe((value) => {
    // See how it's correctly typed as string, also works with any other type.
    console.log(value);
  });

instance
  .cachify('object key', of({ a: 'value', b: 420 }))
  .subscribe((value) => {
    // See how it's correctly typed as object
    console.log(value);
  });
