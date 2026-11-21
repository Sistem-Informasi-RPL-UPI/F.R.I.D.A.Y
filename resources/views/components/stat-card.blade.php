@props(['icon', 'label', 'value', 'note', 'tone' => 'blue'])

<article {{ $attributes->merge(['class' => 'stat-card']) }}>
    <div class="stat-icon {{ $tone }}">
        <x-icon :name="$icon" />
    </div>
    <div>
        <span>{{ $label }}</span>
        <strong>{{ $value }}</strong>
        <small>{{ $note }}</small>
    </div>
</article>
