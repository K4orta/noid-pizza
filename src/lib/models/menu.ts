import { PizzaTopping } from './pizza-topping';
import { PizzaCrust } from './pizza-crust';
import { camelCaseDominos } from '../utils/camel-case-dominos';

export type MenuCategory = {
  code: string;
  name: string;
  hasSubCategories: boolean;
  hasProducts: boolean;
  hasTags: boolean;
  products?: string[];
  subCategories?: Record<string, MenuCategory>;
};

export type DominosMenu = {
  flavors: {
    pizza: Record<
      string,
      {
        code: string;
        description: string;
      }
    >;
  };
  products: {
    S_PIZZA: {
      variants: string[];
    };
  };
  sides: {};
  toppings: {
    pizza: Record<
      string,
      {
        code: string;
        name: string;
        local: boolean;
        tags: Record<string, boolean | string>;
      }
    >;
  };
  variants: Record<
    string,
    {
      code: string;
      flavorCode: string;
      name: string;
      availableToppings: string;
      allowedCookingInstructions: string;
      price: string;
      surcharge: string;
    }
  >;
  preconfiguredProducts: {};
  shortProductDescriptions: {};
  unsupported: {};
  cooking: {};
};

export class Menu {
  public data?: DominosMenu;
  public pizza: {
    crusts: PizzaCrust[];
    toppings: PizzaTopping[];
  };

  constructor(options: unknown) {
    this.pizza = {
      crusts: [],
      toppings: [],
    };
    this.parse(options);
  }

  parse(payload: unknown) {
    this.data = camelCaseDominos(
      payload as Record<string, unknown>
    ) as DominosMenu;

    const crusts = this.data.products['S_PIZZA'].variants.map((variant) => {
      const crust = this.data?.variants[variant]!;
      const flavor = this.data?.flavors.pizza[crust.flavorCode]!;
      const { name, availableToppings, surcharge, allowedCookingInstructions } =
        crust;
      return new PizzaCrust({
        code: variant,
        name,
        description: flavor.description,
        availableToppings: availableToppings.split(','),
        surcharge,
        allowedCookingInstructions: allowedCookingInstructions.split(','),
      });
    });
    this.pizza.crusts = crusts;
    this.pizza.toppings = Object.values(this.data.toppings.pizza).map(
      (topping) => Menu.parseTopping(topping)
    );
  }

  static parseTopping(topping: {
    code: string;
    name: string;
    local: boolean;
    tags: Record<string, string | boolean>;
  }): PizzaTopping {
    const toppingTags = Object.entries(topping.tags)
      .filter(([_, value]) => typeof value === 'boolean')
      .map(([key, _]) => key);

    const parsedTopping = {
      code: topping.code,
      name: topping.name,
      isLocal: topping.local,
      tags: toppingTags,
      exclusivityGroup: topping.tags['exclusiveGroup'] as string | undefined,
    };
    return new PizzaTopping(parsedTopping);
  }
}
