import './styles.css';
import { atom, Provider, useAtom, Atom, PrimitiveAtom } from 'jotai';
import { focusAtom } from 'jotai/optics';
import {
  atomFamily,
  selectAtom,
  splitAtom,
  useAtomCallback,
  useAtomValue
} from 'jotai/utils';
import { FC, ReactNode, useCallback, useEffect, useMemo } from 'react';

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

const addToSelectedAtom = atom(null, (get, set, update) => {
  const mainAtom = get(selectedAtom);
  const object = get(mainAtom);
  console.log(object);

  set(selectedAtom, set(mainAtom, { ...object, children: [...object.children, update] }));
});

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
  const c = useMemo(() => childAtom, [childAtom]);
  const [child] = useAtom(c);
  const childrenFocusAtom = focusAtom(childAtom, (o) => o.path('children'));
  const [select, setSelect] = useAtom(selectedAtom);

  console.log(` ${childAtom} -> selected: ${select}`);

  return (
    <>
      <div
        style={{
          cursor: 'pointer',
          padding: '4px 6px',
          marginBottom: 5,
          borderLeft: select === childAtom ? '10px solid red' : ''
        }}
      >
        <div>
          {child.name} <button onClick={() => setSelect(childAtom)}>SELECT</button>
        </div>
      </div>
      <div style={{ paddingLeft: 20 }}>
        {child?.children ? <Component children={childrenFocusAtom} /> : null}
      </div>
    </>
  );
};

const Children: FC<{ children: PrimitiveAtom<Node[]> }> = ({ children }) => {
  const c = useMemo(() => children, [children]);
  const [, setChildren] = useAtom(c);
  // Re-render and change atom reference !!!
  const childrenSplitAtom = splitAtom(children);
  const d = useMemo(() => childrenSplitAtom, [childrenSplitAtom]);
  const [childrenList] = useAtom(d);

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
      {childrenList.map((c, index) => {
        return <Child component={Children} key={index} childAtom={c} />;
      })}
    </div>
  );
};

const ListWrapper = () => {
  const [, getData] = useAtom(initAtom);
  const [loading] = useAtom(loadingAtom);
  //const [response, setResponse] = useAtom(responseAtom);
  //const select = useAtomValue(selectedAtom);
  //const [, addToSelected] = useAtom(addToSelectedAtom);

  useEffect(() => {
    getData();
  }, [getData]);

  const add = (path) => {
    // const getPath = (data: any[], path: string) => {
    //   return data.map((f) => {
    //     if (f.key === path) {
    //       f.children = [
    //         ...f.children,
    //         { key: '1625121488854', name: 'Another obj', children: [] }
    //       ];
    //     }
    //     return f;
    //   });
    // };
    // if (select) {
    //   addToSelected({ key: '1625121488854', name: 'Another obj', children: [] });
    // } else {
    //   setResponse((d) => {
    //     // const dd = getPath(d, path);
    //     // console.log(dd);
    //     return [...d, { key: '1625121488854', name: 'Another obj', children: [] }];
    //   });
    // }
  };

  return (
    <div>
      <strong>Wrapper</strong>
      <button onClick={() => add('1625121488850')}>Add</button>
      {!loading ? <Children children={responseAtom} /> : 'Loading...'}
    </div>
  );
};

export default function OneObjectList() {
  return (
    <Provider>
      <h3>One object components List</h3>
      <ListWrapper />
    </Provider>
  );
}
