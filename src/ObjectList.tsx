import './styles.css';
import { atom, Provider, useAtom, Atom, PrimitiveAtom } from 'jotai';
import { focusAtom } from 'jotai/optics';
import { atomFamily, selectAtom, splitAtom, useAtomCallback } from 'jotai/utils';
import { FC, ReactNode, useCallback, useEffect } from 'react';

interface Node {
  key: string;
  path: number[];
  name: string;
  children: Node[];
}

const initVals: Node[] = [
  {
    key: '1625121488850',
    path: [0],
    name: 'Asset',
    children: [
      {
        key: '1625121488851',
        path: [0, 0],
        name: 'Some obj',
        children: [
          {
            key: '1625121488855',
            path: [0, 0, 0],
            name: 'Some obj 1',
            children: []
          },
          {
            key: '1625121488856',
            path: [0, 0, 1],
            name: 'Some obj 2',
            children: []
          },
          {
            key: '1625121488857',
            path: [0, 0, 2],
            name: 'Some obj 3',
            children: []
          },
          {
            key: '1625121488858',
            path: [0, 0, 3],
            name: 'Some obj 4',
            children: []
          }
        ]
      },
      {
        key: '1625121488852',
        path: [0, 1],
        name: 'New Obj',
        children: []
      }
    ]
  },
  { key: '1625121488854', path: [1], name: 'Another obj', children: [] }
];

const responseAtom = atom<Node[]>([]);
const loadingAtom = atom(true);
const selectedNodeAtom = atom<Node | null>(null);

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

const addNodeAtom = atom(null, (get, set, update: string) => {
  const list = get(responseAtom);
  const selected = get(selectedNodeAtom);
  if (selected) {
    const deep = (data: any) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].children.length) {
          deep(data[i].children);
        }
        if (data[i].key === selected.key) {
          data[i].children = [
            ...data[i].children,
            {
              key: Date.now().toString(),
              path: [...data[i].path, data[i].children.length],
              name: update,
              children: []
            }
          ];
          return;
        }
      }
    };
    deep(list);
  } else {
    list.push({
      key: Date.now().toString(),
      path: [list.length],
      name: update,
      children: []
    });
  }
  set(responseAtom, [...list]);
});

const removeNodeAtom = atom(null, (get, set, update: Node) => {
  const list = get(responseAtom);
  const selected = get(selectedNodeAtom);
  const deep = (data: Node[], level: number, c: number[]) => {
    const newArr: Node[] = [];
    let count = 0;
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      if (level + 1 === update.path.length && update.path[level] === i) {
        console.log('TO REMOVE - last', [...c, i]);
      } else {
        newArr.push({
          ...element,
          path: [...c, count],
          children: deep(element.children, level + 1, [...c, count])
        });
        count++;
      }
    }

    return newArr;
  };
  const d = deep(list, 0, []);
  set(selectedNodeAtom, selected?.key === update.key ? null : selected);
  set(responseAtom, d);
});

const moveNodeAtom = atom(null, (get, set, update: Node) => {
  const list = get(responseAtom);
  const selected = get(selectedNodeAtom);

  console.log(selected, update);

  const deep = (data: Node[], level: number, c: number[]) => {
    const newArr: Node[] = [];
    let count = 0;
    let count1 = 0;

    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      if (level + 1 === selected?.path.length && selected.path[level] === i) {
        console.log('TO REMOVE - last', [...c, i]);
      } else {
        newArr.push({
          ...element,
          path: [...c, count],
          children: deep(element.children, level + 1, [...c, count])
        });

        count++;
      }
      if (level + 1 !== update?.path.length && update.path[level] !== i) {
        console.log('x', update, [...c, count1]);
        // newArr.push({
        //   ...element,
        //   path: [...c, count1],
        //   children: deep(element.children, level + 1, [...c, count1])
        // });
        count1++;
      }
    }

    return newArr;
  };
  const d = deep(list, 0, []);
  set(selectedNodeAtom, null);
  set(responseAtom, d);
});

const Child: FC<{ child: Node; component: any }> = ({ child, component }) => {
  const Component = component;
  const [selected, setSelected] = useAtom<Node | null>(selectedNodeAtom);
  const [, removeNode] = useAtom(removeNodeAtom);

  const [, moveNode] = useAtom(moveNodeAtom);

  const handleRemove = () => {
    removeNode(child);
  };

  const handleMove = () => {
    moveNode(child);
  };

  return (
    <>
      <div
        style={{
          cursor: 'pointer',
          padding: '4px 6px',
          marginBottom: 5,
          border: selected?.key === child.key ? '1px solid gray' : '',
          pointerEvents: 'auto'
        }}
      >
        <div>
          <span>
            {child.path.join(',')} {'  '}
            {child.name} {child.key}
          </span>

          {selected && selected.key !== child.key ? (
            <button style={{ pointerEvents: 'auto' }} onClick={handleMove}>
              MOVE
            </button>
          ) : null}
          <button
            style={{ pointerEvents: 'auto' }}
            onClick={() =>
              setSelected((s: Node) => (s?.key === child.key ? null : child))
            }
          >
            SELECT
          </button>
          {child.children.length ? null : (
            <button style={{ pointerEvents: 'auto' }} onClick={handleRemove}>
              REMOVE
            </button>
          )}
        </div>
      </div>
      <div style={{ paddingLeft: 20 }}>
        {child?.children ? <Component children={child?.children} /> : null}
      </div>
    </>
  );
};

const Children: FC<{ children: Node[] }> = ({ children }) => {
  return (
    <div>
      {children.map((node, index) => {
        return <Child component={Children} key={node.key} child={node} />;
      })}
    </div>
  );
};

const AddObject = () => {
  const [, addNode] = useAtom(addNodeAtom);

  const handleAdd = (type: string) => {
    addNode(type);
  };

  return (
    <>
      <button onClick={() => handleAdd('light')}>Light</button>
      <button onClick={() => handleAdd('object')}>Object</button>
      <button onClick={() => handleAdd('video')}>Video</button>
      <hr />
    </>
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
      <AddObject />
      {!loading ? <Children children={init} /> : 'Loading...'}
    </div>
  );
};

export default function ObjectList() {
  return (
    <Provider>
      <h3>Big object one atom components List</h3>
      <ListWrapper />
    </Provider>
  );
}
