import styles from './rt-ui.module.css';

/* eslint-disable-next-line */
export interface RtUiProps {}

export function RtUi(props: RtUiProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to RtUi!</h1>
    </div>
  );
}

export default RtUi;
