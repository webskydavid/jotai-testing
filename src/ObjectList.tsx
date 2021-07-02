import './styles.css';
import { atom, Provider, useAtom, Atom, PrimitiveAtom } from 'jotai';
import { focusAtom } from 'jotai/optics';
import { atomFamily, selectAtom, splitAtom, useAtomCallback } from 'jotai/utils';
import { FC, ReactNode, useCallback, useEffect } from 'react';

interface Node {
  key: string;
  name: string;
  children: Node[];
}

const initVals = {
  '1625121488850': {
    key: '1625121488850',
    name: 'Asset',
    children: {
      '1625121488851': {
        key: '1625121488851',
        name: 'Some obj',
        children: {}
      }
    }
  },
  '1625121488854': { key: '1625121488854', name: 'Another obj', children: {} }
};

const responseAtom = atom({});
const loadingAtom = atom(true);
const selectedAtom = atom(undefined);

const initAtom = atom(
  (get) => {
    return get(responseAtom);
  },
  (get, set) => {
    const run = async () => {
      set(loadingAtom, true);
      await new Promise((res) => setTimeout(() => res(true), 600));

      const treeData = (nodes: any) => {
        const data: any = [];
        const keys = Object.keys(nodes);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (nodes[key].children) {
            nodes[key].children = treeData(nodes[key].children);
          }
          data.push(key);
        }

        return data;
      };

      set(responseAtom, Object.keys(initVals));
      set(loadingAtom, false);
    };
    run();
  }
);

const Child: FC<{ childAtom: PrimitiveAtom<Node>; component: any }> = ({
  childAtom,
  component
}) => {
  const Component = component;
  const [child] = useAtom(childAtom);
  const childrenFocusAtom = focusAtom(childAtom, (o) => o.path('children'));

  return (
    <>
      <div
        style={{
          cursor: 'pointer',
          padding: '4px 6px',
          marginBottom: 5
        }}
      >
        <div>{initVals[child]}</div>
      </div>
      <div style={{ paddingLeft: 20 }}>
        {child?.children ? <Component children={Object.keys(childrenFocusAtom)} /> : null}
      </div>
    </>
  );
};

const Children: FC<{ children: PrimitiveAtom<Node[]> }> = ({ children }) => {
  const [, setChildren] = useAtom(children);
  const childrenSplitAtom = splitAtom(children);
  const [childrenList] = useAtom(childrenSplitAtom);

  const add = () => {
    setChildren((s) => [
      ...s,
      {
        key: '1625121488851',
        name: 'Some obj',
        children: []
      }
    ]);
  };

  return (
    <div>
      <button onClick={add}>Add</button>
      {childrenList.map((c, index) => {
        console.log(c);

        return <Child component={Children} key={index} childAtom={c} />;
      })}
    </div>
  );
};

const ListWrapper = () => {
  const [init, getData] = useAtom(initAtom);
  const [loading] = useAtom(loadingAtom);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <div>
      <strong>Wrapper</strong>

      {!loading ? <Children children={responseAtom} /> : 'Loading...'}
    </div>
  );
};

export default function ObjectList() {
  return (
    <Provider>
      <h3>Dynamic creating atom in components List</h3>
      <ListWrapper />
    </Provider>
  );
}
