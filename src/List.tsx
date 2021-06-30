import './styles.css';
import { atom, Provider, useAtom, PrimitiveAtom, WritableAtom } from 'jotai';
import { selectAtom, splitAtom } from 'jotai/utils';
import { FC, useEffect, useMemo } from 'react';

interface Node {
  name: string;
  children: Node[];
}

const initVals = [
  {
    name: 'Name 1',
    children: [
      {
        name: 'Name 1',
        children: []
      },
      {
        name: 'Name 1',
        children: []
      }
    ]
  },
  { name: 'Name 2', children: [] }
];

const responseAtom = atom<Node[]>([]);

const initAtom = atom(null, (get, set) => {
  const run = async () => {
    await new Promise((res) => setTimeout(() => res(true), 1000));
    console.log('run');
    set(responseAtom, initVals);
  };
  run();
});

const Child: FC<{ a: Node }> = ({ a }) => {
  const memAtom = useMemo(() => atom(a), [a]);
  const [item] = useAtom<Node>(memAtom);

  return (
    <div
      style={{
        cursor: 'pointer',
        padding: '4px 6px',
        borderLeft: '1px solid gray',
        marginBottom: 5
      }}
    >
      {item.name} {`${memAtom}`}
      <button>DEL</button>
    </div>
  );
};

const Children: FC<{ data: Node[] }> = ({ data }) => {
  const list = useMemo(() => atom(data), [data]);
  const [d, setD] = useAtom(list);

  const handleDel = (node) => {
    console.log('del');
    setD((prev: Node[]) => [...prev, { name: 'fe', children: [] }]);
  };

  const handleAdd = () => {
    console.log('test');
    setD((prev) => [...prev, { name: 'fe', children: [] }]);
  };
  return (
    <div style={{ paddingLeft: 20 }}>
      <button onClick={handleAdd}>Add</button>
      {d.map((node, index) => {
        if (node.children.length === 0) {
          return <Child key={index} a={node} />;
        }

        return <Children key={index} data={node.children} />;
      })}
    </div>
  );
};

const ListWrapper = () => {
  const [list, add] = useAtom(responseAtom);
  //const [list, remove] = useAtom(splitAtom<Node, unknown>(responseAtom));
  const [, getData] = useAtom(initAtom);

  console.log(list);

  useEffect(() => {
    getData();
  }, [getData]);

  const handleAdd = () => {
    console.log('click', list);
    add((prev) => [...prev, { name: 'fjeifjei', children: [] }]);
  };

  return (
    <div>
      <button onClick={handleAdd}>Add Node</button>
      <hr />
      Wrapper
      {/* {list.map((i, index) => (
        <Child a={i} key={index} onClick={() => {}} />
      ))} */}
      <Children data={list} />
    </div>
  );
};

export default function List() {
  return (
    <Provider>
      <h4>List</h4>
      <ListWrapper />
    </Provider>
  );
}
