class Scale
  attr_reader :name, :notes

  def initialize(name, notes)
    @name = name
    @notes = notes
  end

  def transpose(shift)
    @notes.each_with_index do |n, index|
      @notes[index] += shift
    end
  end
end

scales = []
scales << Scale.new("major", [0, 2, 4, 5, 7, 9, 11])
scales << Scale.new("minor", [0, 2, 3, 5, 7, 8, 10])



def guess_scale(scales, melody)
  scales.product((0..11).to_a).max_by { |(scale, shift)|
    bonus = 0
    bonus += melody[0] == scale.notes[0] + shift ? 3 : 0
    bonus += melody[-1] == scale.notes[0] + shift ? 5 : 0
    p bonus
    scale.notes.count { |note| melody.index(note + shift) } + bonus
  }
end

p guess_scale(scales, [4, 7, 11])
