import './style.css';
import { of, Observable, shareReplay } from 'rxjs';

interface ICache<T> {
  value$: Observable<T>;
  expiry: number;
}

class CacheService {
  private readonly cacheMap = new Map<string, ICache<unknown>>();
  private readonly CACHE_SIZE = 1;
  private readonly CACHE_EXPIRY_INTERVAL = 10 * 60 * 1000; // 10 minutes

  public cachify<T>(key: string, value$: Observable<T>): Observable<T> {
    if (!this.cached(key)) this.set<T>(key, value$);

    return this.get<T>(key);
  }

  private cached(key: string): boolean {
    if (!this.cacheMap.has(key)) return false;

    if (this.cacheMap.get(key).expiry < Date.now()) {
      this.cacheMap.delete(key);
      return false;
    }

    return true;
  }

  private set<T>(key: string, value$: Observable<T>) {
    const value: ICache<T> = {
      value$: value$.pipe(shareReplay(this.CACHE_SIZE)),
      expiry: Date.now() + this.CACHE_EXPIRY_INTERVAL,
    };
    this.cacheMap.set(key, value);
  }

  private get<T>(key: string): Observable<T> {
    return this.cacheMap.get(key).value$ as Observable<T>;
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
