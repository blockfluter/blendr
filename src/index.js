import st from './style/main.scss';

import React from 'react';
import { render } from 'react-dom';
import Blendr from './ui/blendr';
import Store from './stores/store';


render((
  <Blendr {...Store}/>
), document.getElementById('blendr'));





