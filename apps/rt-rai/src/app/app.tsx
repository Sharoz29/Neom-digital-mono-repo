// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';

import NxWelcome from './nx-welcome';
import { PegaUserApiControllerClient } from '@neom/rt-ui';

export async function App() {


  const apiClient = new PegaUserApiControllerClient('/', {});

  const something = await apiClient.get()
  

  return (
    <div>
      {
        something.map((item) => {
          return <h1>{item.name}</h1>
        })
      }
      <NxWelcome title="rt-rai" />
    </div>
  );
}

export default App;
