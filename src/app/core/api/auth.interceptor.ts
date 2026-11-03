import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../auth/auth.service';

/** Our own API only (never leak the token to third-party URLs). */
const isApi = (url: string) => url.startsWith(environment.apiUrl);

/** Turns a backend error into a short Arabic message (uses `message` from the body when present). */
export function errorMessage(err: HttpErrorResponse): string {
  const body = err.error as { message?: string } | null;
  if (body && typeof body === 'object' && body.message) return body.message;
  if (err.status === 0) return 'تعذّر الاتصال بالخادم، تأكد من الاتصال وحاول مرة أخرى';
  if (err.status === 403) return 'ليس لديك صلاحية لتنفيذ هذا الإجراء';
  if (err.status === 404) return 'البيانات المطلوبة غير موجودة';
  if (err.status === 409) return 'تم تعديل البيانات من مستخدم آخر، أعد التحميل وحاول مرة أخرى';
  if (err.status === 422 || err.status === 400) return 'البيانات المدخلة غير صحيحة';
  return 'حدث خطأ غير متوقع، حاول مرة أخرى';
}

/** Adds the bearer token to API calls, logs out on 401 and shows one error toast for any failed request. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const token = auth.token();
  const authed = token && isApi(req.url) ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(authed).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) auth.logout();
      else if (isApi(req.url)) toast.error(errorMessage(err));
      return throwError(() => err);
    }),
  );
};
