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

// const addToSelectedAtom = atom(null, (get, set, update) => {
//   const mainAtom = get(selectedAtom);
//   const object = get(mainAtom);
//   console.log(object);

//   set(selectedAtom, set(mainAtom, { ...object, children: [...object.children, update] }));
// });

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
  // const [, setSelect] = useAtom(selectedAtom);

  ///console.log(` ${c} -> selected: ${select}`);
  const handleSelect = () => {
    console.log(`${childAtom}`);
    // setSelect(childAtom);
  };

  console.log('Child', `${childAtom}`);

  return (
    <>
      <div
        style={{
          cursor: 'pointer',
          padding: '4px 6px',
          marginBottom: 5
          // borderLeft: select === c ? '10px solid red' : ''
        }}
      >
        <div>
          {child.name} <button onClick={handleSelect}>SELECT</button>
        </div>
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

  console.log('Children', `${children}`);

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
  const [response, setResponse] = useAtom(responseAtom);
  //const select = useAtomValue(selectedAtom);
  //const [, addToSelected] = useAtom(addToSelectedAtom);

  useEffect(() => {
    getData();
  }, [getData]);

  console.log('ListWrapper', `${responseAtom}`);

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
    if (false) {
      //addToSelected({ key: '1625121488854', name: 'Another obj', children: [] });
    } else {
      setResponse((d) => {
        // const dd = getPath(d, path);
        // console.log(dd);
        return [...d, { key: '1625121488854', name: 'Another obj', children: [] }];
      });
    }
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
