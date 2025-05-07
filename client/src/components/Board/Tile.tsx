const Tile = ({ coords }: { coords: { x: number; y: number } }) => {
  return (
    <div className='w-10 h-10 bg-gray-200 border'>
      <p>
        {coords.x}, {coords.y}
      </p>
    </div>
  );
};

export default Tile;
