export const dateFormat = (now: Date, target: Date): string => {
  const diff = now.getTime() - target.getTime();

  if (diff < 60 * 1000) {
    const seconds = Math.floor(diff / 1000);
    return `${seconds}秒前`;
  }

  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}分前`;
  }

  if (diff < 60 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}時間前`;
  }

  const month = target.getMonth() + 1;
  const date = target.getDate();

  return `${month}月${date}日`;
};
