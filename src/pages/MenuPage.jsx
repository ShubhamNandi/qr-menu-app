import MenuItem from '../components/MenuItem'

const MenuPage = ({ menuItems, cart, onAddToCart, onUpdateQuantity, getItemQuantity }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Our Menu</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            quantity={getItemQuantity(item.id)}
            onAddToCart={onAddToCart}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>
    </div>
  )
}

export default MenuPage

