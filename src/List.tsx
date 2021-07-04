import './styles.css';
import { atom, Provider, useAtom, Atom, PrimitiveAtom } from 'jotai';
import { atomFamily, selectAtom, useAtomCallback } from 'jotai/utils';
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

const responseAtom = atom<Atom<Node>[]>([]);
const loadingAtom = atom(true);
const selectedAtom = atom<Atom<Node | undefined> | undefined>(undefined);

const initAtom = atom(null, (get, set) => {
  const run = async () => {
    set(loadingAtom, true);
    await new Promise((res) => setTimeout(() => res(true), 600));

    const treeData = (nodes: any) => {
      const data: any = [];
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.children) {
          n.children = atom(treeData(n.children));
        }
        data.push(atom(n));
      }
      return data;
    };

    set(responseAtom, treeData(initVals));
    set(loadingAtom, false);
  };
  run();
});

const Child: FC<{ a: PrimitiveAtom<Node>; handleRemove: any; component: any }> = ({
  a,
  component,
  handleRemove
}) => {
  const Component = component;
  const [child] = useAtom<Node>(a);
  const [selected, setSelected] = useAtom(selectedAtom);

  const select = () => {
    setSelected(a);
  };

  const move = () => {};

  return (
    <>
      <div
        style={{
          cursor: 'pointer',
          padding: '4px 6px',
          marginBottom: 5
        }}
      >
        <div
          style={{
            borderLeft: selected === a ? '10px solid gray' : '1px solid gray'
          }}
        >
          {child.name}
          <button onClick={() => handleRemove(a)}>DEL</button>
          <button onClick={select}>SELECT</button>
          <button onClick={move}>MOVE</button>
        </div>
      </div>
      <div style={{ paddingLeft: 20 }}>
        {child?.children ? <Component data={child?.children} /> : null}
        {/* {child?.children?.map((a) => (
          <Child key={`${a}`} a={a} onClick={() => {}} />
        ))} */}
      </div>
    </>
  );
};

const Children: FC<{ data: Atom<Atom<Node>[]> }> = ({ data }) => {
  const [children, setChildren] = useAtom(data);

  const handleRemove = (a) => {
    console.log(children);

    setChildren((c) => {
      return c.filter((f) => f !== a);
    });
  };

  return (
    <div>
      {children.map((node, index) => {
        return (
          <Child component={Children} key={index} a={node} handleRemove={handleRemove} />
        );
      })}
    </div>
  );
};

const addToSelectedAtom = atom(null, (get, set, update) => {
  const mainAtom = get(selectedAtom);
  const object = get(mainAtom);
  const array = get(object?.children);

  set(object?.children, [...array, atom(update)]);
  set(mainAtom, { ...object, children: object?.children });
  set(selectedAtom, mainAtom);
});

const AddObject = () => {
  const [, setChildren] = useAtom(responseAtom);
  const [selected] = useAtom(selectedAtom);
  const [, addToSelected] = useAtom(addToSelectedAtom);

  const handleAdd = (type: string) => {
    console.log(selected);

    if (selected) {
      addToSelected({ key: Date.now().toString(), name: type, children: atom([]) });
    } else {
      setChildren((s) => {
        return [
          ...s,
          atom({ key: Date.now().toString(), name: type, children: atom([]) })
        ];
      });
    }
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

const event = new CustomEvent('foo', { detail: 'foo' });

const cherryGL = {
  changeValues: (data: any) => new CustomEvent('foo', { detail: data })
};

const ListWrapper = () => {
  const [, getData] = useAtom(initAtom);
  const [loading] = useAtom(loadingAtom);
  const [selected] = useAtom(selectedAtom);

  useEffect(() => {
    getData();
  }, [getData]);

  useEffect(() => {
    window.addEventListener('foo', (e) => console.log(e));
  }, []);

  const run = () => {
    window.dispatchEvent(cherryGL.changeValues('fwefe'));
    window.dispatchEvent(cherryGL.changeValues('1'));
    window.dispatchEvent(cherryGL.changeValues('2'));
    window.dispatchEvent(cherryGL.changeValues('3'));
  };

  return (
    <div>
      <strong>Wrapper</strong>
      <AddObject />
      {!loading ? <Children data={responseAtom} /> : 'Loading...'}
      <button onClick={run}>fewfe</button>
      <div>
        <h4>inspector</h4>
        <pre>{JSON.stringify(selected?.key)}</pre>
      </div>
    </div>
  );
};

export default function List() {
  return (
    <Provider>
      <h3>Dynamic adding atom List</h3>
      <ListWrapper />
    </Provider>
  );
}
