import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../ui/button';

function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = useCallback(() => {
    void navigate({ to: '/' });
  }, [navigate]);

  return (
    <div className="flex flex-col gap-10 justify-center items-center text-center py-32">
      <div className="flex flex-col gap-4 items-center">
        <p className="text-gray-600">페이지를 찾을 수 없습니다.</p>
        <Button onClick={handleGoHome}>홈으로 돌아가기</Button>
      </div>
    </div>
  );
}

export default NotFoundPage;
