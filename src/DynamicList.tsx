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

const initVals = [
  {
    key: '1625121488850',
    name: 'Asset',
    children: [
      {
        key: '1625121488851',
        name: 'Some obj',
        children: []
      },
      {
        key: '1625121488852',
        name: 'New Obj',
        children: []
      }
    ]
  },
  { key: '1625121488854', name: 'Another obj', children: [] }
];

const responseAtom = atom<Node[]>([]);
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

      set(responseAtom, initVals);
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
        <div>{child.name}</div>
      </div>
      <div style={{ paddingLeft: 20 }}>
        {child?.children ? <Component children={childrenFocusAtom} /> : null}
      </div>
    </>
  );
};

const Children: FC<{ children: PrimitiveAtom<Node[]> }> = ({ children }) => {
  const [, setChildren] = useAtom(children);
  const childrenSplitAtom = splitAtom(children);
  const [childrenList] = useAtom(childrenSplitAtom);

  const [select, setSelect] = useAtom(selectedAtom);

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
      <button onClick={() => setSelect(children)}>SELECT</button>
      {childrenList.map((c, index) => {
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

export default function DynamicList() {
  return (
    <Provider>
      <h3>Dynamic creating atom in components List</h3>
      <ListWrapper />
    </Provider>
  );
}
